import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ParallelExecutorService {
  private readonly logger = new Logger(ParallelExecutorService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Execute test cases in parallel
   */
  async executeParallel(
    runId: string,
    testCases: any[],
    workerCount: number = 4,
  ): Promise<any[]> {
    const results: any[] = [];
    const workers = Array.from({ length: workerCount }, (_, i) => i);

    // Distribute test cases among workers
    const chunks = this.chunkArray(testCases, workerCount);

    // Execute in parallel
    const workerPromises = workers.map((workerId) =>
      this.executeWorker(runId, chunks[workerId] || [], workerId),
    );

    const workerResults = await Promise.all(workerPromises);

    // Flatten results
    for (const workerResult of workerResults) {
      results.push(...workerResult);
    }

    return results;
  }

  /**
   * Execute tests in a single worker
   */
  private async executeWorker(
    runId: string,
    testCases: any[],
    workerId: number,
  ): Promise<any[]> {
    const results: any[] = [];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const result = await this.executeTestCase(testCase);
        const duration = Date.now() - startTime;

        results.push({
          caseId: testCase.id,
          status: result.status,
          error: result.error,
          duration,
        });

        // Save to database
        await this.prisma.testResult.create({
          data: {
            runId,
            caseId: testCase.id,
            status: result.status,
            errorMessage: result.error,
            duration,
          },
        });

        // Emit progress
        this.eventEmitter.emit('test.case.completed', {
          runId,
          caseId: testCase.id,
          workerId,
          status: result.status,
        });
      } catch (error) {
        this.logger.error(`Test execution failed in worker ${workerId}`, error);
        results.push({
          caseId: testCase.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Execute individual test case
   */
  private async executeTestCase(testCase: any): Promise<any> {
    try {
      // In production, you would actually execute the test
      // For now, simulate test execution
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

      return {
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        error: null,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Chunk array for distribution
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}