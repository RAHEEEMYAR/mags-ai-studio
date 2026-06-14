import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventRouterService {
  private readonly logger = new Logger(EventRouterService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Route classified event to appropriate systems
   */
  async routeEvent(event: any): Promise<void> {
    // 1. Route to audit logs (if auditable)
    if (event.isAuditable) {
      await this.routeToAudit(event);
    }

    // 2. Route to threat detector
    if (event.category === 'auth' || event.initialRiskScore > 20) {
      await this.routeToThreatDetector(event);
    }

    // 3. Route to WebSocket (real-time dashboard)
    if (event.initialRiskScore >= 40 || event.shouldTriggerAlert) {
      this.emitToWebSocket(event);
    }

    // 4. Route to analytics (cache for trend analysis)
    await this.routeToAnalytics(event);

    // 5. Route to compliance (if relevant)
    if (event.category === 'data' || event.category === 'admin') {
      await this.routeToCompliance(event);
    }
  }

  private async routeToAudit(event: any): Promise<void> {
    // Store in audit logs - handled by audit service
    this.eventEmitter.emit('audit.log', event);
  }

  private async routeToThreatDetector(event: any): Promise<void> {
    // Queue threat analysis
    this.eventEmitter.emit('threat.analyze', event);
  }

  private emitToWebSocket(event: any): void {
    // Real-time notification to dashboard
    this.eventEmitter.emit('security.alert', {
      type: 'security_event',
      severity: event.initialRiskScore >= 70 ? 'critical' : 'high',
      event,
    });
  }

  private async routeToAnalytics(event: any): Promise<void> {
    // Cache event for analytics and trend analysis
    const dayKey = `analytics:${new Date().toISOString().split('T')[0]}`;
    await this.redisService.pushToList(dayKey, JSON.stringify(event));
  }

  private async routeToCompliance(event: any): Promise<void> {
    // Log for compliance purposes
    this.eventEmitter.emit('compliance.log', event);
  }
}