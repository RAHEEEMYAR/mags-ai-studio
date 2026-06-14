import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class EmbeddingGeneratorService {
  private readonly logger = new Logger(EmbeddingGeneratorService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.apiKey = this.configService.get('embedding.openai.apiKey');
    this.baseUrl = this.configService.get('embedding.openai.baseUrl');
    this.model = this.configService.get('embedding.model');
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache
    const cacheKey = `embedding:${this.hashText(text)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Generate embedding
    const embedding = await this.callOpenAIAPI(text);

    // Cache result
    await this.redisService.set(cacheKey, JSON.stringify(embedding), 86400); // 24 hours

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Check which ones are cached
    const uncached: { index: number; text: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const cacheKey = `embedding:${this.hashText(texts[i])}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        embeddings[i] = JSON.parse(cached);
      } else {
        uncached.push({ index: i, text: texts[i] });
      }
    }

    // Call API for uncached items (batch)
    if (uncached.length > 0) {
      const batchTexts = uncached.map((u) => u.text);
      const batchEmbeddings = await this.callOpenAIAPIBatch(batchTexts);

      for (let i = 0; i < uncached.length; i++) {
        const index = uncached[i].index;
        const embedding = batchEmbeddings[i];
        embeddings[index] = embedding;

        // Cache
        const cacheKey = `embedding:${this.hashText(uncached[i].text)}`;
        await this.redisService.set(cacheKey, JSON.stringify(embedding), 86400);
      }
    }

    return embeddings;
  }

  /**
   * Call OpenAI Embeddings API
   */
  private async callOpenAIAPI(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.model,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = (await response.json()) as any;
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Call OpenAI API for batch
   */
  private async callOpenAIAPIBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: texts,
          model: this.model,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = (await response.json()) as any;
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      this.logger.error(`Batch embedding generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hash text for caching
   */
  private hashText(text: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
