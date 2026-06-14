import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestOrchestratorQueueService } from '@/queue/test-orchestrator-queue.service';
import { ParallelExecutorService } from './parallel-executor.service';
import { ResultAggregatorService } from './result-aggregator.service';

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private queueService: TestOrchestratorQueueService,
    private parallelExecutor: ParallelExecutorService,
    private resultAggregator: ResultAggregatorService,
  ) {}

  /**
   * Run test suite
   */
  async runTestSuite(
    userId: string,
    suiteId: string,
    options: {
      parallel?: boolean;
      workers?: number;
      environment?: string;
    } = {},
  ): Promise<any> {
    try {
      // Get test suite
      const suite = await this.prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: { testCases: true },
      });

      if (!suite) {
        throw new BadRequestException('Test suite not found');
      }

      // Create test run
      const testRun = await this.prisma.testRun.create({
        data: {
          userId,
          suiteId,
          runType: 'manual',
          parallelCount: options.parallel ? (options.workers || 4) : 1,
          environment: options.environment || 'staging',
          totalTests: suite.testCases.length,
        },
      });

      // Queue execution
      await this.queueService.addTestRun({
        runId: testRun.id,
        suiteId,
        userId,
        testCases: suite.testCases,
        parallel: options.parallel ?? true,
        workers: options.workers || 4,
      });

      this.logger.log(`Test run started: ${testRun.id}`);

      // Emit event
      this.eventEmitter.emit('test.run.started', {
        runId: testRun.id,
        suiteId,
        testCount: suite.testCases.length,
      });

      return {
        id: testRun.id,
        status: 'running',
        totalTests: suite.testCases.length,
        startedAt: testRun.startedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to start test run: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute test suite (called by queue worker)
   */
  async executeTestSuite(
    runId: string,
    testCases: any[],
    parallel: boolean = true,
  ): Promise<any> {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: runId },
    });

    if (!testRun) {
      throw new Error(`Test run not found: ${runId}`);
    }

    try {
      let results: any[];

      if (parallel) {
        // Execute in parallel
        results = await this.parallelExecutor.executeParallel(
          runId,
          testCases,
          testRun.parallelCount,
        );
      } else {
        // Execute sequentially
        results = await this.executeSequentially(runId, testCases);
      }

      // Aggregate results
      const aggregated = await this.resultAggregator.aggregate(runId, results);

      // Update test run
      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          passedTests: aggregated.passedCount,
          failedTests: aggregated.failedCount,
          skippedTests: aggregated.skippedCount,
          durationMs: aggregated.totalDuration,
        },
      });

      this.logger.log(`Test run completed: ${runId}`);

      // Emit completion event
      this.eventEmitter.emit('test.run.completed', {
        runId,
        passRate: aggregated.passRate,
        failureCount: aggregated.failedCount,
      });

      return aggregated;
    } catch (error) {
      this.logger.error(`Test execution failed: ${error.message}`);

      await this.prisma.testRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Execute tests sequentially
   */
  private async executeSequentially(runId: string, testCases: any[]): Promise<any[]> {
    const results: any[] = [];

    for (const testCase of testCases) {
      try {
        const result = await this.executeTestCase(testCase);
        results.push(result);

        // Save result
        await this.prisma.testResult.create({
          data: {
            runId,
            caseId: testCase.id,
            status: result.status,
            errorMessage: result.error,
            duration: result.duration,
            logs: result.logs,
          },
        });

        // Emit progress
        this.eventEmitter.emit('test.progress', {
          runId,
          completed: results.length,
          total: testCases.length,
        });
      } catch (error) {
        this.logger.error(`Test case failed: ${testCase.id}`, error);
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
    const startTime = Date.now();

    try {
      // Parse and execute test code
      const testFunction = new Function(testCase.testCode);
      const result = await testFunction();

      return {
        caseId: testCase.id,
        status: 'passed',
        duration: Date.now() - startTime,
        result,
      };
    } catch (error) {
      return {
        caseId: testCase.id,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message,
        stackTrace: error.stack,
      };
    }
  }

  /**
   * Get test run results
   */
  async getTestRunResults(runId: string): Promise<any> {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        results: {
          include: { testCase: true },
        },
      },
    });

    if (!testRun) {
      throw new BadRequestException('Test run not found');
    }

    return testRun;
  }

  /**
   * List recent test runs
   */
  async listTestRuns(userId: string, limit: number = 20): Promise<any[]> {
    return await this.prisma.testRun.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        suite: true,
      },
    });
  }
}