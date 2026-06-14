import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BruteForceDetector {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  /**
   * Detect brute force attack
   */
  async detect(event: any): Promise<any | null> {
    if (event.eventType !== 'auth_failed') return null;

    const config = this.configService.get('security.bruteForce');
    const failureCountKey = `brute_force:${event.userId}:${event.ipAddress}`;

    // Get current failure count
    const count = parseInt(
      (await this.redisService.get(failureCountKey)) || '0',
    );
    const newCount = count + 1;

    // Set with window expiration
    await this.redisService.set(failureCountKey, newCount.toString(), config.windowSeconds);

    if (newCount >= config.maxFailedAttempts) {
      return {
        type: 'brute_force',
        description: `${newCount} failed login attempts from ${event.ipAddress}`,
        indicators: ['multiple_failed_logins'],
        confidence: Math.min(newCount / (config.maxFailedAttempts * 2), 1),
        score: Math.min(newCount * 15, 100),
      };
    }

    return null;
  }
}