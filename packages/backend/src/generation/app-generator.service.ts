import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { AppGeneratorQueueService } from '@/queue/app-generator-queue.service';
import { PromptAnalyzerService } from './prompt-analyzer.service';
import { ArchitecturePlannerService } from './architecture-planner.service';
import { ProjectScaffolderService } from './project-scaffolder.service';
import { CodeGeneratorService } from './code-generator.service';
import { CodeValidatorService } from './validators/code-validator.service';
import { GenerateAppDto } from '@/apps/dto/generate-app.dto';

@Injectable()
export class AppGeneratorService {
  private readonly logger = new Logger(AppGeneratorService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private queueService: AppGeneratorQueueService,
    private promptAnalyzer: PromptAnalyzerService,
    private architecturePlanner: ArchitecturePlannerService,
    private scaffolder: ProjectScaffolderService,
    private codeGenerator: CodeGeneratorService,
    private validator: CodeValidatorService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate new app from prompt
   */
  async generateApp(userId: string, generateDto: GenerateAppDto) {
    const { prompt, name, description, templateId } = generateDto;

    // Validate prompt
    if (!prompt || prompt.trim().length < 10) {
      throw new BadRequestException('Prompt must be at least 10 characters');
    }

    // Create app record
    const app = await this.prisma.generatedApp.create({
      data: {
        userId,
        name: name || this.generateAppName(prompt),
        description,
        prompt,
        status: 'generating',
      },
    });

    // Create generation job
    const job = await this.prisma.generationJob.create({
      data: {
        appId: app.id,
        jobType: 'initial_generation',
        status: 'pending',
      },
    });

    // Queue generation
    await this.queueService.addGenerationJob({
      jobId: job.id,
      appId: app.id,
      userId,
      prompt,
      templateId,
    });

    this.logger.log(`App generation queued: ${app.id}`);

    return {
      id: app.id,
      name: app.name,
      status: 'generating',
      jobId: job.id,
    };
  }

  /**
   * Execute full generation pipeline (called by queue worker)
   */
  async executeGenerationPipeline(jobId: string, appId: string, userId: string, prompt: string) {
    const job = await this.prisma.generationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error(`Generation job not found: ${jobId}`);
    }

    try {
      // Step 1: Analyze Prompt
      this.logger.log(`[${appId}] Step 1: Analyzing prompt`);
      await this.updateJobProgress(jobId, 'analyzing_prompt', 10);

      const promptAnalysis = await this.promptAnalyzer.analyzePrompt(prompt);

      // Step 2: Plan Architecture
      this.logger.log(`[${appId}] Step 2: Planning architecture`);
      await this.updateJobProgress(jobId, 'planning_architecture', 25);

      const architecture = await this.architecturePlanner.planArchitecture(promptAnalysis);

      // Step 3: Generate Project Structure
      this.logger.log(`[${appId}] Step 3: Generating project structure`);
      await this.updateJobProgress(jobId, 'scaffolding', 40);

      const projectStructure = await this.scaffolder.scaffoldProject(
        appId,
        architecture,
      );

      // Step 4: Generate Code Files (parallel)
      this.logger.log(`[${appId}] Step 4: Generating code files`);
      await this.updateJobProgress(jobId, 'generating_code', 50);

      const codeFiles = await this.codeGenerator.generateAllFiles(
        appId,
        architecture,
        projectStructure,
      );

      // Step 5: Validate Code
      this.logger.log(`[${appId}] Step 5: Validating code`);
      await this.updateJobProgress(jobId, 'validating', 80);

      const validationResult = await this.validator.validateApp(appId);

      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Step 6: Create Version
      this.logger.log(`[${appId}] Step 6: Creating version`);
      const version = await this.createAppVersion(appId, userId, prompt, codeFiles);

      // Update app
      await this.prisma.generatedApp.update({
        where: { id: appId },
        data: {
          status: 'ready',
          currentVersionId: version.id,
          fileCount: codeFiles.length,
          lastGeneratedAt: new Date(),
          techStack: architecture,
          architecture: promptAnalysis,
        },
      });

      // Complete job
      await this.updateJobProgress(jobId, 'completed', 100);

      this.logger.log(`App generation completed: ${appId}`);

      return {
        success: true,
        appId,
        fileCount: codeFiles.length,
      };
    } catch (error) {
      this.logger.error(`App generation failed: ${appId}`, error);

      await this.prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errors: error.message,
        },
      });

      await this.prisma.generatedApp.update({
        where: { id: appId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Regenerate specific file
   */
  async regenerateFile(appId: string, userId: string, fileId: string) {
    const file = await this.prisma.appFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.appId !== appId) {
      throw new Error('File not found');
    }

    // Get app architecture
    const app = await this.prisma.generatedApp.findUnique({
      where: { id: appId },
    });

    if (!app) {
      throw new Error('App not found');
    }

    // Get other files for context
    const allFiles = await this.prisma.appFile.findMany({
      where: { appId },
    });

    // Regenerate single file
    const newContent = await this.codeGenerator.regenerateFile(
      file,
      app.architecture as any,
      allFiles,
    );

    // Save edit history
    await this.prisma.editHistory.create({
      data: {
        fileId,
        originalContent: file.content,
        newContent,
        regeneratedBy: 'ai-regenerator',
      },
    });

    // Update file
    const updated = await this.prisma.appFile.update({
      where: { id: fileId },
      data: {
        content: newContent,
        isEdited: true,
        lastModifiedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Get app details
   */
  async getApp(appId: string, userId: string) {
    const app = await this.prisma.generatedApp.findUnique({
      where: { id: appId },
      include: {
        files: true,
        versions: true,
        deployments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!app) {
      throw new Error('App not found');
    }

    if (app.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return app;
  }

  /**
   * List user apps
   */
  async getUserApps(userId: string) {
    return await this.prisma.generatedApp.findMany({
      where: { userId, status: { not: 'archived' } },
      include: {
        _count: { select: { files: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete app
   */
  async deleteApp(appId: string, userId: string) {
    const app = await this.getApp(appId, userId);

    await this.prisma.generatedApp.update({
      where: { id: appId },
      data: { status: 'archived' },
    });

    return { message: 'App archived' };
  }

  /**
   * Helper: Generate app name from prompt
   */
  private generateAppName(prompt: string): string {
    const words = prompt.split(' ').slice(0, 3).join('-');
    return `app-${words.toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
  }

  /**
   * Helper: Update job progress
   */
  private async updateJobProgress(jobId: string, step: string, progress: number) {
    await this.prisma.generationJob.update({
      where: { id: jobId },
      data: {
        currentStep: step,
        progress,
      },
    });
  }

  /**
   * Helper: Create app version
   */
  private async createAppVersion(
    appId: string,
    userId: string,
    prompt: string,
    files: any[],
  ) {
    // Get latest version number
    const latestVersion = await this.prisma.appVersion.findFirst({
      where: { appId },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    const filesSnapshot = files.map((f) => ({
      path: f.path,
      language: f.language,
      size: f.size,
    }));

    return await this.prisma.appVersion.create({
      data: {
        appId,
        versionNumber,
        prompt,
        filesSnapshot,
        status: 'completed',
      },
    });
  }
}
