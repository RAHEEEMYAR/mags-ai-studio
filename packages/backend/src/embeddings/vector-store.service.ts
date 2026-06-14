import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EmbeddingGeneratorService } from './embedding-generator.service';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingGenerator: EmbeddingGeneratorService,
  ) {}

  /**
   * Store embedding for code chunk
   */
  async storeEmbedding(repoId: string, chunkId: string, embedding: number[]) {
    await this.prisma.codeEmbedding.create({
      data: {
        repoId,
        chunkId,
        embedding,
        modelUsed: 'text-embedding-3-small',
      },
    });

    this.logger.log(`Stored embedding for chunk: ${chunkId}`);
  }

  /**
   * Generate and store embeddings for repository
   */
  async generateAndStoreEmbeddings(repoId: string) {
    // Get all chunks without embeddings
    const chunks = await this.prisma.codeChunk.findMany({
      where: {
        repoId,
        embeddings: { none: {} }, // Chunks without embeddings
      },
    });

    if (chunks.length === 0) {
      return { total: 0, stored: 0 };
    }

    // Generate embeddings in batches
    const batchSize = 10;
    let stored = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.content);

      const embeddings = await this.embeddingGenerator.generateEmbeddings(texts);

      // Store embeddings
      for (let j = 0; j < batch.length; j++) {
        await this.storeEmbedding(repoId, batch[j].id, embeddings[j]);
        stored++;
      }

      this.logger.log(`Generated ${stored}/${chunks.length} embeddings`);
    }

    return { total: chunks.length, stored };
  }

  /**
   * Search embeddings by semantic similarity
   */
  async semanticSearch(repoId: string, query: string, limit: number = 10) {
    // Generate query embedding
    const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);

    // Search using pgvector similarity
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT 
        ce.id,
        cc.id as chunk_id,
        cc.content,
        cc.file_id,
        cc.chunk_type,
        cc.name,
        rf.path,
        rf.language,
        1 - (ce.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector) as similarity
      FROM code_embeddings ce
      JOIN code_chunks cc ON ce.chunk_id = cc.id
      JOIN repo_files rf ON cc.file_id = rf.id
      WHERE ce.repo_id = ${repoId}
      ORDER BY ce.embedding <=> ${`[${queryEmbedding.join(',')}]`}::vector
      LIMIT ${limit}
    `;

    return results.map((r: any) => ({
      chunkId: r.chunk_id,
      content: r.content,
      fileId: r.file_id,
      filePath: r.path,
      language: r.language,
      chunkType: r.chunk_type,
      name: r.name,
      similarity: parseFloat(r.similarity),
    }));
  }
}
