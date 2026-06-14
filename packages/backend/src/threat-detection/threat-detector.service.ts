import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { LoginAnomalyDetector } from './detectors/login-anomaly.detector';
import { BruteForceDetector } from './detectors/brute-force.detector';
import { RateAnomalyDetector } from './detectors/rate-anomaly.detector';
import { BehaviorAnomalyDetector } from './detectors/behavior-anomaly.detector';
import { DataAccessAnomalyDetector } from './detectors/data-access.detector';
import { RiskScorerService } from './risk-scorer.service';

@Injectable()
export class ThreatDetectorService {
  private readonly logger = new Logger(ThreatDetectorService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private loginAnomalyDetector: LoginAnomalyDetector,
    private bruteForceDetector: BruteForceDetector,
    private rateAnomalyDetector: RateAnomalyDetector,
    private behaviorAnomalyDetector: BehaviorAnomalyDetector,
    private dataAccessDetector: DataAccessAnomalyDetector,
    private riskScorer: RiskScorerService,
  ) {}

  /**
   * Analyze event for threats
   */
  async analyzeEvent(event: any): Promise<any> {
    const threats: any[] = [];

    try {
      // Run all detectors in parallel
      const detectionPromises = [
        this.loginAnomalyDetector.detect(event),
        this.bruteForceDetector.detect(event),
        this.rateAnomalyDetector.detect(event),
        this.behaviorAnomalyDetector.detect(event),
        this.dataAccessDetector.detect(event),
      ];

      const results = await Promise.allSettled(detectionPromises);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          threats.push(result.value);
        }
      }

      // Calculate aggregate risk score
      const aggregateRisk = this.riskScorer.calculateAggregateRisk(threats);

      // Store threat detection if threats found
      if (threats.length > 0) {
        await this.storeThreatDetection(event, threats, aggregateRisk);
      }

      // Update user anomaly score
      await this.updateAnomalyScore(event.userId, aggregateRisk);

      return {
        threatsDetected: threats.length > 0,
        threats,
        aggregateRisk,
      };
    } catch (error) {
      this.logger.error(`Threat analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Store threat detection record
   */
  private async storeThreatDetection(
    event: any,
    threats: any[],
    riskScore: number,
  ): Promise<void> {
    for (const threat of threats) {
      await this.prisma.threatDetection.create({
        data: {
          userId: event.userId,
          threatType: threat.type,
          severity: this.calculateSeverity(riskScore),
          description: threat.description,
          indicators: threat.indicators || [],
          confidenceScore: threat.confidence || 0.5,
          riskScore,
          status: 'detected',
        },
      });
    }
  }

  /**
   * Update user anomaly score
   */
  private async updateAnomalyScore(userId: string, riskScore: number): Promise<void> {
    // Delete old anomaly score
    await this.prisma.anomalyScore.deleteMany({
      where: { userId },
    });

    // Create new one
    await this.prisma.anomalyScore.create({
      data: {
        userId,
        score: Math.min(riskScore, 100),
        factors: {
          lastAnalyzedAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    // Cache for quick access
    await this.redisService.set(`anomaly:${userId}`, riskScore.toString(), 3600);
  }

  /**
   * Calculate severity level
   */
  private calculateSeverity(riskScore: number): string {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }
}