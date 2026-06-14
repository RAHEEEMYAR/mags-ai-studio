import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AIService } from '@/ai/ai.service';
import { ConfigService } from '@nestjs/config';
import { BackendGeneratorService } from './file-generator/backend-generator.service';
import { FrontendGeneratorService } from './file-generator/frontend-generator.service';
import { SchemaGeneratorService } from './file-generator/schema-generator.service';
import { IntegrationGeneratorService } from './file-generator/integration-generator.service';
import { ConfigGeneratorService } from './file-generator/config-generator.service';

@Injectable()
export class CodeGeneratorService {
  private readonly logger = new Logger(CodeGeneratorService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private configService: ConfigService,
    private backendGenerator: BackendGeneratorService,
    private frontendGenerator: FrontendGeneratorService,
    private schemaGenerator: SchemaGeneratorService,
    private integrationGenerator: IntegrationGeneratorService,
    private configGenerator: ConfigGeneratorService,
  ) {}

  /**
   * Generate all files for app
   */
  async generateAllFiles(
    appId: string,
    architecture: any,
    projectStructure: any,
  ): Promise<any[]> {
    const files: any[] = [];
    const maxConcurrent = this.configService.get('generation.pipeline.maxConcurrentFiles');

    // Generate backend files
    const backendFiles = await this.backendGenerator.generateFiles(appId, architecture);
    files.push(...backendFiles);

    // Generate frontend files
    const frontendFiles = await this.frontendGenerator.generateFiles(appId, architecture);
    files.push(...frontendFiles);

    // Generate database schema
    const schemaFiles = await this.schemaGenerator.generateFiles(appId, architecture);
    files.push(...schemaFiles);

    // Generate integration files
    const integrationFiles = await this.integrationGenerator.generateFiles(
      appId,
      architecture,
    );
    files.push(...integrationFiles);

    // Generate config files
    const configFiles = await this.configGenerator.generateFiles(appId, architecture);
    files.push(...configFiles);

    // Store all files in database
    for (const file of files) {
      await this.prisma.appFile.create({
        data: {
          appId,
          path: file.path,
          name: file.name,
          language: file.language,
          content: file.content,
          size: file.content.length,
          generatedBy: file.generatedBy,
        },
      });
    }

    return files;
  }

  /**
   * Regenerate single file
   */
  async regenerateFile(file: any, architecture: any, allFiles: any[]): Promise<string> {
    const regenerationPrompt = `
      Regenerate this code file based on the architecture:
      
      File: ${file.path}
      Language: ${file.language}
      Current Content:
      \`\`\`${file.language}
      ${file.content}
      \`\`\`
      
      Architecture:
      ${JSON.stringify(architecture, null, 2)}
      
      Other files for context:
      ${allFiles.map((f) => `- ${f.path}`).join('\n')}
      
      Provide only the updated file content without explanations.
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: regenerationPrompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 4000,
    });

    return this.extractCode(response.content, file.language);
  }

  private extractCode(text: string, language: string): string {
    const match = text.match(new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'i'));
    return match ? match[1] : text;
  }
}
