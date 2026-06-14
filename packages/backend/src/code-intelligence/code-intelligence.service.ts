import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '@/ai/ai.service';
import { PrismaService } from '@/prisma/prisma.service';
import { SemanticSearchService } from '@/embeddings/semantic-search.service';
import { VectorStoreService } from '@/embeddings/vector-store.service';

@Injectable()
export class CodeIntelligenceService {
  private readonly logger = new Logger(CodeIntelligenceService.name);

  constructor(
    private aiService: AIService,
    private prisma: PrismaService,
    private semanticSearch: SemanticSearchService,
    private vectorStore: VectorStoreService,
  ) {}

  /**
   * Explain code file
   */
  async explainFile(repoId: string, fileId: string): Promise<string> {
    const file = await this.prisma.repoFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('File not found');
    }

    const prompt = `
      Analyze and explain this ${file.language} code file:
      
      File: ${file.path}
      Language: ${file.language}
      Lines: ${file.lineCount}
      
      Content:
      \`\`\`${file.language}
      ${file.content}
      \`\`\`
      
      Provide:
      1. High-level purpose of the file
      2. Key functions/classes and what they do
      3. Important dependencies
      4. Overall architecture role
      5. Any potential issues or concerns
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
    });

    return response.content;
  }

  /**
   * Summarize repository
   */
  async summarizeRepository(repoId: string): Promise<string> {
    const repo = await this.prisma.repository.findUnique({
      where: { id: repoId },
      include: {
        files: {
          select: { path: true, language: true, lineCount: true },
          take: 20,
        },
      },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    const prompt = `
      Summarize this code repository:
      
      Name: ${repo.name}
      Description: ${repo.description}
      Primary Language: ${repo.language}
      Total Files: ${repo.totalFiles}
      Total Lines: ${repo.totalLines}
      
      Key Files:
      ${repo.files.map((f) => `- ${f.path} (${f.language}, ${f.lineCount} lines)`).join('\n')}
      
      Provide:
      1. Repository purpose and goal
      2. Main components/modules
      3. Technology stack
      4. Architecture overview
      5. Key dependencies
      6. Potential improvements
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 2000,
    });

    return response.content;
  }

  /**
   * Find bugs in code
   */
  async findBugs(repoId: string, fileId?: string): Promise<any> {
    let files;

    if (fileId) {
      files = await this.prisma.repoFile.findMany({
        where: { id: fileId },
      });
    } else {
      files = await this.prisma.repoFile.findMany({
        where: { repoId },
        take: 10, // Limit to first 10 files
      });
    }

    const prompt = `
      Analyze these code files for potential bugs, security issues, and code quality problems:
      
      ${files.map((f) => `\nFile: ${f.path}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n')}
      
      For each issue found, provide:
      1. Issue type (bug, security risk, code smell, etc.)
      2. Location (file and line)
      3. Description
      4. Severity (high, medium, low)
      5. Suggested fix
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 3000,
    });

    return {
      fileIds: files.map((f) => f.id),
      analysis: response.content,
    };
  }

  /**
   * Suggest improvements
   */
  async suggestImprovements(repoId: string, fileId: string): Promise<string> {
    const file = await this.prisma.repoFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('File not found');
    }

    const prompt = `
      Review this ${file.language} code and suggest improvements:
      
      File: ${file.path}
      
      \`\`\`${file.language}
      ${file.content}
      \`\`\`
      
      Suggest improvements in:
      1. Performance optimization
      2. Code readability and maintainability
      3. Testing and error handling
      4. Best practices
      5. Security considerations
      6. Design patterns
      
      Provide specific, actionable suggestions.
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.5,
      maxTokens: 2500,
    });

    return response.content;
  }

  /**
   * Perform semantic search and answer question
   */
  async answerQuestion(repoId: string, question: string): Promise<any> {
    // Search for relevant code
    const searchResults = await this.semanticSearch.search(repoId, question, 5);

    if (searchResults.length === 0) {
      return {
        answer: 'Could not find relevant code in the repository to answer this question.',
        relevantCode: [],
      };
    }

    // Build context from search results
    const context = searchResults
      .map((r) => `File: ${r.filePath}\n\`\`\`${r.language}\n${r.content}\n\`\`\``)
      .join('\n\n');

    const prompt = `
      Based on this code from the repository:
      
      ${context}
      
      Answer this question: ${question}
      
      Provide:
      1. Direct answer to the question
      2. Reference to specific code sections
      3. Any additional context needed to understand
    `;

    const response = await this.aiService.complete({
      messages: [{ role: 'user', content: prompt }],
      modelId: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1500,
    });

    return {
      answer: response.content,
      relevantCode: searchResults.map((r) => ({
        filePath: r.filePath,
        chunkType: r.chunkType,
        lineRange: `${r.startLine}-${r.endLine}`,
        similarity: r.similarity,
      })),
    };
  }
}
