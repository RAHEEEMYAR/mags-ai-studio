import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { EventClassifierService } from './event-classifier.service';
import { EventRouterService } from './event-router.service';

export interface SecurityEventData {
  eventType: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  description: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventCollectorService {
  private readonly logger = new Logger(EventCollectorService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private classifier: EventClassifierService,
    private router: EventRouterService,
  ) {}

  /**
   * Collect and process security event
   */
  async collectEvent(eventData: SecurityEventData): Promise<any> {
    try {
      // Step 1: Create event in database
      const event = await this.prisma.securityEvent.create({
        data: {
          userId: eventData.userId,
          eventType: eventData.eventType,
          description: eventData.description,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          deviceId: eventData.deviceId,
          metadata: eventData.metadata,
        },
      });

      // Step 2: Classify event
      const classified = await this.classifier.classifyEvent(event);

      // Step 3: Route event
      await this.router.routeEvent(classified);

      // Step 4: Cache for quick access
      await this.cacheEvent(event);

      this.logger.debug(`Event collected: ${event.id} (${event.eventType})`);

      return event;
    } catch (error) {
      this.logger.error(`Failed to collect event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Collect batch events
   */
  async collectBatch(events: SecurityEventData[]): Promise<any[]> {
    return Promise.all(events.map((e) => this.collectEvent(e)));
  }

  /**
   * Cache event for quick access
   */
  private async cacheEvent(event: any): Promise<void> {
    const cacheKey = `event:${event.id}`;
    await this.redisService.setJSON(cacheKey, event, 3600); // 1 hour
  }

  /**
   * Get recent events for user
   */
  async getUserRecentEvents(userId: string, limit: number = 50): Promise<any[]> {
    return await this.prisma.securityEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}