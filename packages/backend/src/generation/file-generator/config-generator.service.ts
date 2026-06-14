import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigGeneratorService {
  /**
   * Generate config files (.env, docker, etc.)
   */
  async generateFiles(appId: string, architecture: any): Promise<any[]> {
    const files: any[] = [];

    // .env.example
    files.push({
      path: 'packages/backend/.env.example',
      name: '.env.example',
      language: 'env',
      content: `NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/app_db"
`,
      generatedBy: 'config-generator',
    });

    // .env.frontend
    files.push({
      path: 'packages/frontend/.env.example',
      name: '.env.example',
      language: 'env',
      content: `NEXT_PUBLIC_API_URL=http://localhost:3001
`,
      generatedBy: 'config-generator',
    });

    return files;
  }
}
