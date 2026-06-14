import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProjectScaffolderService {
  private readonly logger = new Logger(ProjectScaffolderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate project folder structure
   */
  async scaffoldProject(appId: string, architecture: any): Promise<any> {
    const structure = {
      root: {
        'package.json': this.generateRootPackageJson(architecture),
        'docker-compose.yml': this.generateDockerCompose(architecture),
        '.gitignore': this.generateGitignore(),
        'README.md': this.generateReadme(),
      },
      'packages/frontend': {
        'package.json': this.generateFrontendPackageJson(architecture),
        'next.config.js': this.generateNextConfig(),
        'tsconfig.json': this.generateTsConfig(),
        'tailwind.config.js': this.generateTailwindConfig(),
        'src/app': {
          'layout.tsx': '',
          'page.tsx': '',
        },
        'src/components': {},
        'src/lib': {},
        'src/types': {},
      },
      'packages/backend': {
        'package.json': this.generateBackendPackageJson(architecture),
        'tsconfig.json': this.generateTsConfig(),
        '.env.example': '',
        'src/main.ts': '',
        'src/app.module.ts': '',
        'src/app.controller.ts': '',
        'src/app.service.ts': '',
      },
      'packages/database': {
        'schema.prisma': '',
        'migrations': {},
      },
    };

    return structure;
  }

  private generateRootPackageJson(architecture: any): string {
    return JSON.stringify(
      {
        name: 'generated-app',
        version: '0.1.0',
        private: true,
        workspaces: ['packages/*'],
        scripts: {
          dev: 'turbo dev',
          build: 'turbo build',
          test: 'turbo test',
        },
        devDependencies: {
          turbo: '^1.10.0',
          prettier: '^3.0.0',
          eslint: '^8.0.0',
        },
      },
      null,
      2,
    );
  }

  private generateDockerCompose(architecture: any): string {
    if (architecture.database?.type !== 'postgres') {
      return '';
    }

    return `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${architecture.database?.dbName || 'app_db'}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
  }

  private generateFrontendPackageJson(architecture: any): string {
    return JSON.stringify(
      {
        name: '@app/frontend',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          zustand: '^4.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/react': '^18.0.0',
          'tailwindcss': '^3.0.0',
        },
      },
      null,
      2,
    );
  }

  private generateBackendPackageJson(architecture: any): string {
    return JSON.stringify(
      {
        name: '@app/backend',
        version: '0.1.0',
        private: true,
        scripts: {
          start: 'node dist/main',
          dev: 'ts-node-dev src/main.ts',
          build: 'tsc',
        },
        dependencies: {
          '@nestjs/common': '^10.0.0',
          '@nestjs/core': '^10.0.0',
          '@prisma/client': '^5.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/node': '^20.0.0',
          prisma: '^5.0.0',
        },
      },
      null,
      2,
    );
  }

  private generateNextConfig(): string {
    return `const config = {
  reactStrictMode: true,
};

export default config;
`;
  }

  private generateTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          noImplicitAny: true,
        },
      },
      null,
      2,
    );
  }

  private generateTailwindConfig(): string {
    return `export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
  }

  private generateGitignore(): string {
    return `node_modules/
dist/
build/
.env
.env.local
.DS_Store
`;
  }

  private generateReadme(): string {
    return `# Generated App

Auto-generated full-stack application.

## Getting Started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Structure

- \`packages/frontend\` - Next.js frontend
- \`packages/backend\` - NestJS backend
- \`packages/database\` - Prisma database schema
`;
  }
}
