import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);

  constructor(
    private vectorStore: VectorStoreService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  /**
   * Search repository with natural language query
   */
  async search(repoId: string, query: string, limit: number = 20) {
    // Check cache
    const cacheKey = `search:${repoId}:${query}`;
    const cached = await this.redisService.getJSON(cacheKey);

    if (cached) {
      return cached;
    }

    // Perform semantic search
    const results = await this.vectorStore.semanticSearch(repoId, query, limit);

    // Enrich results with file info
    const enriched = await Promise.all(
      results.map(async (result) => {
        const file = await this.prisma.repoFile.findUnique({
          where: { id: result.fileId },
          select: { path: true, lineCount: true },
        });

        return {
          ...result,
          file: file
            ? {
                path: file.path,
                lineCount: file.lineCount,
              }
            : null,
        };
      }),
    );

    // Cache results
    await this.redisService.setJSON(cacheKey, enriched, 3600); // 1 hour

    return enriched;
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(
    repoId: string,
    query: string,
    filters: {
      language?: string;
      type?: string;
      path?: string;
    },
    limit: number = 20,
  ) {
    let results = await this.vectorStore.semanticSearch(repoId, query, limit * 2);

    // Apply filters
    if (filters.language) {
      results = results.filter((r) => r.language === filters.language);
    }

    if (filters.type) {
      results = results.filter((r) => r.chunkType === filters.type);
    }

    if (filters.path) {
      results = results.filter((r) => r.filePath.includes(filters.path!));
    }

    return results.slice(0, limit);
  }
}
