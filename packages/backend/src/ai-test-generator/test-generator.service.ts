import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CodebaseAnalyzerService } from './codebase-analyzer.service';
import { TestCaseGeneratorService } from './test-case-generator.service';
import { CoverageAnalyzerService } from './coverage-analyzer.service';

@Injectable()
export class TestGeneratorService {
  private readonly logger = new Logger(TestGeneratorService.name);

  constructor(
    private aiService: AIService,
    private prisma: PrismaService,
    private codebaseAnalyzer: CodebaseAnalyzerService,
    private testCaseGenerator: TestCaseGeneratorService,
    private coverageAnalyzer: CoverageAnalyzerService,
  ) {}

  /**
   * Generate tests for a module
   */
  async generateTestsForModule(
    modulePath: string,
    targetTestCount: number = 10,
  ): Promise<any> {
    try {
      // Step 1: Analyze codebase
      this.logger.log(`Analyzing module: ${modulePath}`);
      const analysis = await this.codebaseAnalyzer.analyzeModule(modulePath);

      // Step 2: Generate test cases
      this.logger.log('Generating test cases...');
      const testCases = await this.testCaseGenerator.generateTestCases(
        analysis,
        targetTestCount,
      );

      // Step 3: Create test suite
      const suite = await this.prisma.testSuite.create({
        data: {
          name: `Generated Tests - ${modulePath}`,
          description: `Auto-generated tests for ${modulePath}`,
          suiteType: 'unit',
          targetModule: modulePath,
          isAutomated: true,
          testCount: testCases.length,
        },
      });

      // Step 4: Create test cases
      for (const testCase of testCases) {
        await this.prisma.testCase.create({
          data: {
            suiteId: suite.id,
            name: testCase.name,
            description: testCase.description,
            testCode: testCase.code,
            caseType: testCase.caseType,
            expectedResult: testCase.expectedResult,
            isAIGenerated: true,
            generatedFrom: modulePath,
          },
        });
      }

      this.logger.log(`Generated ${testCases.length} test cases for ${modulePath}`);

      return {
        suiteId: suite.id,
        testCount: testCases.length,
        testCases,
      };
    } catch (error) {
      this.logger.error(`Test generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Suggest missing tests based on coverage gaps
   */
  async suggestMissingTests(modulePath: string): Promise<any> {
    try {
      // Analyze current coverage
      const coverage = await this.coverageAnalyzer.analyzeCoverage(modulePath);

      // Identify gaps
      const gaps = coverage.gaps;

      if (gaps.length === 0) {
        return { message: 'Good coverage!', suggestions: [] };
      }

      // Generate suggestions via AI
      const suggestions = await this.generateSuggestionsForGaps(gaps);

      return {
        currentCoverage: coverage.percentage,
        gaps: gaps.length,
        suggestions,
      };
    } catch (error) {
      this.logger.error(`Coverage suggestion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate suggestions for coverage gaps
   */
  private async generateSuggestionsForGaps(gaps: any[]): Promise<any[]> {
    const prompt = `
      These code sections have low test coverage:
      ${gaps.map((g) => `- ${g.file}: line ${g.line} (${g.reason})`).join('\n')}
      
      Suggest specific test cases to improve coverage. Return as JSON array.
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.5,
      maxTokens: 2000,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return [{ suggestion: response.content }];
    }
  }

  /**
   * Analyze test quality
   */
  async analyzeTestQuality(testCaseId: string): Promise<any> {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    const qualityPrompt = `
      Analyze this test case for quality:
      
      Test: ${testCase.name}
      Code:
      \`\`\`
      ${testCase.testCode}
      \`\`\`
      
      Provide quality score (0-1) and suggestions for improvement.
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: qualityPrompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      return { analysis: response.content };
    }
  }
}