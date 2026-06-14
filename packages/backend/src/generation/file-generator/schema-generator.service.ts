import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SchemaGeneratorService {
  private readonly logger = new Logger(SchemaGeneratorService.name);

  /**
   * Generate Prisma schema
   */
  async generateFiles(appId: string, architecture: any): Promise<any[]> {
    const schema = this.generatePrismaSchema(architecture);

    return [
      {
        path: 'packages/database/schema.prisma',
        name: 'schema.prisma',
        language: 'prisma',
        content: schema,
        generatedBy: 'schema-generator',
      },
      {
        path: 'packages/database/.env.example',
        name: '.env.example',
        language: 'env',
        content: this.generateEnvExample(),
        generatedBy: 'schema-generator',
      },
    ];
  }

  private generatePrismaSchema(architecture: any): string {
    return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
`;
  }

  private generateEnvExample(): string {
    return `DATABASE_URL="postgresql://user:password@localhost:5432/app_db"
NODE_ENV=development
PORT=3001
`;
  }
}
