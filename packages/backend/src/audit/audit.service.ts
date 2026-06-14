import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create audit log (immutable)
   */
  async logAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    changesBefore: any = null,
    changesAfter: any = null,
    context: any = {},
  ): Promise<any> {
    try {
      // Get previous log for hash chaining
      const previousLog = await this.prisma.auditLog.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Generate hash for this log
      const logData = {
        userId,
        action,
        resourceType,
        resourceId,
        changesBefore,
        changesAfter,
        timestamp: new Date().toISOString(),
        previousHash: previousLog?.logHash,
      };

      const logHash = this.generateHash(JSON.stringify(logData));

      // Create audit log
      const auditLog = await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          changesBefore,
          changesAfter,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          previousHash: previousLog?.logHash,
          logHash,
          complianceRelevant: this.isComplianceRelevant(action),
        },
      });

      this.logger.log(`Audit log created: ${auditLog.id}`);
      return auditLog;
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify log integrity
   */
  async verifyIntegrity(logId: string): Promise<boolean> {
    const log = await this.prisma.auditLog.findUnique({
      where: { id: logId },
    });

    if (!log) return false;

    const logData = {
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      changesBefore: log.changesBefore,
      changesAfter: log.changesAfter,
      timestamp: log.createdAt.toISOString(),
      previousHash: log.previousHash,
    };

    const calculatedHash = this.generateHash(JSON.stringify(logData));
    return calculatedHash === log.logHash;
  }

  /**
   * Get audit logs for user
   */
  async getUserAuditLogs(
    userId: string,
    skip: number = 0,
    take: number = 50,
  ): Promise<any> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({ where: { userId } });

    return { logs, total };
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    userId: string,
    filters: {
      action?: string;
      resourceType?: string;
      dateFrom?: Date;
      dateTo?: Date;
      ipAddress?: string;
    },
    skip: number = 0,
    take: number = 50,
  ): Promise<any> {
    const where: any = { userId };

    if (filters.action) where.action = { contains: filters.action };
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.dateFrom) where.createdAt = { gte: filters.dateFrom };
    if (filters.dateTo) {
      where.createdAt = { ...where.createdAt, lte: filters.dateTo };
    }
    if (filters.ipAddress) where.ipAddress = filters.ipAddress;

    const logs = await this.prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.auditLog.count({ where });

    return { logs, total };
  }

  /**
   * Export audit logs
   */
  async exportLogs(
    userId: string,
    format: 'csv' | 'json' = 'csv',
  ): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = [
        'ID',
        'Action',
        'ResourceType',
        'ResourceId',
        'IPAddress',
        'CreatedAt',
      ];
      const rows = logs.map((log) => [
        log.id,
        log.action,
        log.resourceType,
        log.resourceId || '',
        log.ipAddress || '',
        log.createdAt.toISOString(),
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
      return csvContent;
    }
  }

  /**
   * Helper: Generate hash for log integrity
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Helper: Determine if action is compliance-relevant
   */
  private isComplianceRelevant(action: string): boolean {
    const complianceActions = [
      'user_created',
      'user_deleted',
      'user_data_exported',
      'user_data_deleted',
      'permissions_changed',
      'password_reset',
      'mfa_enabled',
      'account_suspended',
    ];
    return complianceActions.includes(action);
  }
}