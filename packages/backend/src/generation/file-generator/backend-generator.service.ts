import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class BackendGeneratorService {
  private readonly logger = new Logger(BackendGeneratorService.name);

  constructor(private aiService: AIService) {}

  /**
   * Generate backend files
   */
  async generateFiles(appId: string, architecture: any): Promise<any[]> {
    const files: any[] = [];

    // Generate main.ts
    files.push({
      path: 'packages/backend/src/main.ts',
      name: 'main.ts',
      language: 'typescript',
      content: this.generateMainFile(),
      generatedBy: 'backend-generator',
    });

    // Generate app.module.ts
    files.push({
      path: 'packages/backend/src/app.module.ts',
      name: 'app.module.ts',
      language: 'typescript',
      content: await this.generateAppModule(architecture),
      generatedBy: 'backend-generator',
    });

    // Generate app.service.ts
    files.push({
      path: 'packages/backend/src/app.service.ts',
      name: 'app.service.ts',
      language: 'typescript',
      content: this.generateAppService(),
      generatedBy: 'backend-generator',
    });

    // Generate app.controller.ts
    files.push({
      path: 'packages/backend/src/app.controller.ts',
      name: 'app.controller.ts',
      language: 'typescript',
      content: this.generateAppController(),
      generatedBy: 'backend-generator',
    });

    return files;
  }

  private generateMainFile(): string {
    return `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3001);
  console.log(\`🚀 Server is running on port \${process.env.PORT || 3001}\`);
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
`;
  }

  private async generateAppModule(architecture: any): Promise<string> {
    return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;
  }

  private generateAppService(): string {
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from the API!';
  }
}
`;
  }

  private generateAppController(): string {
    return `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
`;
  }
}
