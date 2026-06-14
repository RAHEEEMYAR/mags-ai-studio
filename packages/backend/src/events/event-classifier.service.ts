import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventClassifierService {
  private readonly logger = new Logger(EventClassifierService.name);

  /**
   * Classify event and assign risk level
   */
  async classifyEvent(event: any): Promise<any> {
    const category = this.getCategory(event.eventType);
    const riskScore = this.calculateRiskScore(event);

    return {
      ...event,
      category,
      initialRiskScore: riskScore,
      shouldTriggerAlert: riskScore >= 60,
    };
  }

  /**
   * Determine event category
   */
  private getCategory(eventType: string): string {
    if (eventType.startsWith('auth_')) return 'auth';
    if (eventType.startsWith('api_')) return 'api';
    if (eventType.startsWith('admin_')) return 'admin';
    if (eventType.startsWith('data_')) return 'data';
    return 'system';
  }

  /**
   * Calculate initial risk score (0-100)
   */
  private calculateRiskScore(event: any): number {
    let score = 0;

    switch (event.eventType) {
      case 'auth_login':
        score = 5; // Low risk
        break;
      case 'auth_failed':
        score = 15; // Medium-low risk
        break;
      case 'admin_action':
        score = 25; // Medium risk
        break;
      case 'data_deletion':
        score = 40; // High risk
        break;
      case 'data_export':
        score = 30; // High-medium risk
        break;
      case 'system_anomaly':
        score = 35; // High-medium risk
        break;
      default:
        score = 10;
    }

    return score;
  }
}