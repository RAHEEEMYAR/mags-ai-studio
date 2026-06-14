import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class ArchitecturePlannerService {
  private readonly logger = new Logger(ArchitecturePlannerService.name);

  constructor(private aiService: AIService) {}

  /**
   * Plan app architecture based on requirements
   */
  async planArchitecture(requirements: any): Promise<any> {
    const planPrompt = `
      Based on these requirements:
      ${JSON.stringify(requirements)}
      
      Design a technical architecture including:
      
      {
        "frontend": {
          "framework": "nextjs|react|vue",
          "styling": "tailwind|styled-components",
          "stateManagement": "zustand|redux",
          "ui": "shadcn|material|custom"
        },
        "backend": {
          "framework": "nestjs|express|fastapi",
          "language": "typescript|python",
          "authentication": "jwt|oauth|nextauth"
        },
        "database": {
          "type": "postgres|mongodb|mysql",
          "orm": "prisma|typeorm",
          "schema": ["table1", "table2", ...]
        },
        "integrations": ["stripe|mailgun|etc"],
        "infrastructure": {
          "hosting": "vercel|heroku|aws",
          "cdn": true/false,
          "caching": "redis|memcached"
        }
      }
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: planPrompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
    });

    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return this.getDefaultArchitecture();
    }
  }

  private getDefaultArchitecture(): any {
    return {
      frontend: {
        framework: 'nextjs',
        styling: 'tailwind',
        stateManagement: 'zustand',
        ui: 'shadcn',
      },
      backend: {
        framework: 'nestjs',
        language: 'typescript',
        authentication: 'jwt',
      },
      database: {
        type: 'postgres',
        orm: 'prisma',
      },
      infrastructure: {
        hosting: 'vercel',
      },
    };
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : '{}';
  }
}
