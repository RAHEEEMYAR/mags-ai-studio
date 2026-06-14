import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginAnomalyDetector {
  private readonly logger = new Logger(LoginAnomalyDetector.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Detect suspicious login patterns
   */
  async detect(event: any): Promise<any | null> {
    if (event.eventType !== 'auth_login') return null;

    const indicators: string[] = [];
    let score = 0;

    // Get user's last login
    const lastLogin = await this.prisma.userSessionLog.findFirst({
      where: {
        userId: event.userId,
        isActive: false,
      },
      orderBy: { logoutTime: 'desc' },
    });

    if (!lastLogin) return null; // New user, not anomalous

    // Check 1: Geolocation anomaly
    if (event.metadata?.country && lastLogin.country) {
      if (event.metadata.country !== lastLogin.country) {
        const geoThreshold = this.configService.get(
          'security.suspiciousLogin.geolocationThreshold',
        );
        const distance = this.calculateDistance(
          lastLogin.country,
          event.metadata.country,
        );

        if (distance > geoThreshold) {
          indicators.push('unusual_location');
          score += 30;
        }
      }
    }

    // Check 2: Time-of-day anomaly
    const lastLoginHour = lastLogin.loginTime?.getHours() || 0;
    const currentHour = new Date().getHours();
    const hourDiff = Math.abs(currentHour - lastLoginHour);

    if (hourDiff > 12) {
      indicators.push('unusual_time');
      score += 15;
    }

    // Check 3: Device change
    if (event.deviceId && lastLogin.deviceId && event.deviceId !== lastLogin.deviceId) {
      indicators.push('device_changed');
      score += 20;
    }

    if (indicators.length === 0) return null;

    return {
      type: 'suspicious_login',
      description: `Suspicious login detected: ${indicators.join(', ')}`,
      indicators,
      confidence: Math.min(score / 100, 1),
      score,
    };
  }

  private calculateDistance(country1: string, country2: string): number {
    // Simplified: just check if different (in production, use actual geolocation)
    return country1 === country2 ? 0 : 1000;
  }
}