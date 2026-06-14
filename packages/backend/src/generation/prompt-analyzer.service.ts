import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';

@Injectable()
export class PromptAnalyzerService {
  private readonly logger = new Logger(PromptAnalyzerService.name);

  constructor(private aiService: AIService) {}

  /**
   * Analyze user prompt and extract requirements
   */
  async analyzePrompt(prompt: string): Promise<any> {
    const analysisPrompt = `
      Analyze this app development prompt and extract the requirements:
      
      "${prompt}"
      
      Provide a JSON response with:
      {
        "appType": "saas/web/mobile/dashboard",
        "mainFeatures": ["feature1", "feature2", ...],
        "requiredAuth": true/false,
        "requiresPayment": true/false,
        "requiresDatabase": true/false,
        "requiresAPI": true/false,
        "estimatedComplexity": "simple/medium/complex",
        "userBase": "B2B/B2C/internal",
        "keyRequirements": ["req1", "req2", ...]
      }
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: analysisPrompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1500,
    });

    try {
      return JSON.parse(this.extractJson(response.content));
    } catch {
      return {
        appType: 'web',
        mainFeatures: [],
        requiredAuth: true,
        requiresPayment: false,
        requiresDatabase: true,
        requiresAPI: true,
        estimatedComplexity: 'medium',
      };
    }
  }

  private extractJson(text: string): string {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : '{}';
  }
}
