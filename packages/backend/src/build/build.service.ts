import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class BuildService {
  private readonly logger = new Logger(BuildService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Build app
   */
  async buildApp(appId: string, userId: string): Promise<any> {
    // Create build record
    const previousBuilds = await this.prisma.appBuild.count({
      where: { appId },
    });

    const build = await this.prisma.appBuild.create({
      data: {
        userId,
        appId,
        buildNumber: previousBuilds + 1,
        status: 'building',
        startedAt: new Date(),
      },
    });

    try {
      const appPath = await this.getAppPath(appId);

      // Install dependencies
      this.logger.log(`[BUILD ${build.id}] Installing dependencies...`);
      await this.installDependencies(appPath);

      // Type check
      this.logger.log(`[BUILD ${build.id}] Type checking...`);
      await this.typeCheck(appPath);

      // Lint
      this.logger.log(`[BUILD ${build.id}] Linting...`);
      await this.lint(appPath);

      // Mark as successful
      await this.prisma.appBuild.update({
        where: { id: build.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          duration: Date.now() - build.startedAt!.getTime(),
        },
      });

      return { success: true, buildId: build.id };
    } catch (error) {
      this.logger.error(`Build failed: ${error.message}`);

      await this.prisma.appBuild.update({
        where: { id: build.id },
        data: {
          status: 'failed',
          errors: error.message,
          completedAt: new Date(),
          duration: Date.now() - build.startedAt!.getTime(),
        },
      });

      throw error;
    }
  }

  private async getAppPath(appId: string): Promise<string> {
    return path.join('/tmp/workspaces', appId);
  }

  private async installDependencies(appPath: string): Promise<void> {
    const pm = this.configService.get('build.packageManager') || 'pnpm';
    const { stdout, stderr } = await execAsync(`cd ${appPath} && ${pm} install`, {
      timeout: 120000,
    });

    if (stderr && !stderr.includes('WARN')) {
      throw new Error(`Dependency installation failed: ${stderr}`);
    }
  }

  private async typeCheck(appPath: string): Promise<void> {
    const { stdout, stderr } = await execAsync(`cd ${appPath} && npx tsc --noEmit`, {
      timeout: 60000,
    });

    if (stderr) {
      throw new Error(`Type checking failed: ${stderr}`);
    }
  }

  private async lint(appPath: string): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync(
        `cd ${appPath} && npx eslint . --max-warnings 10`,
        {
          timeout: 60000,
        },
      );
    } catch (error) {
      this.logger.warn(`Linting warnings/errors: ${error.message}`);
      // Don't fail on linting, just warn
    }
  }
}
