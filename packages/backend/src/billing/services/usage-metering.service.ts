import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsageType } from '@prisma/client';

@Injectable()
export class UsageMeteringService {
  constructor(private prisma: PrismaService) {}

  async trackUsage(
    userId: string,
    subscriptionId: string,
    billingCycleId: string,
    usageType: UsageType,
    quantity: number,
    unitPrice: number,
    referenceType?: string,
    referenceId?: string,
  ) {
    const totalCost = quantity * unitPrice;

    return this.prisma.usageRecord.create({
      data: {
        subscriptionId,
        billingCycleId,
        userId,
        usageType,
        quantity,
        unit: this.getUnitForUsageType(usageType),
        unitPrice,
        totalCost,
        referenceType,
        referenceId,
      },
    });
  }

  async getCurrentCycleUsage(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: {
        plan: true,
        billingCycles: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!subscription || !subscription.billingCycles[0]) {
      throw new NotFoundException('No active billing cycle');
    }

    const billingCycle = subscription.billingCycles[0];

    const usageRecords = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId: subscription.id,
        billingCycleId: billingCycle.id,
      },
    });

    // Group by usage type
    const groupedUsage = usageRecords.reduce((acc, record) => {
      if (!acc[record.usageType]) {
        acc[record.usageType] = {
          type: record.usageType,
          quantity: 0,
          cost: 0,
          unit: record.unit,
          limit: this.getUsageLimitForPlan(subscription.plan, record.usageType),
        };
      }
      acc[record.usageType].quantity += record.quantity;
      acc[record.usageType].cost += record.totalCost;
      return acc;
    }, {} as Record<string, any>);

    return {
      billingCyclePeriod: {
        start: billingCycle.startDate,
        end: billingCycle.endDate,
      },
      usage: Object.values(groupedUsage),
      totalCost: usageRecords.reduce((sum, r) => sum + r.totalCost, 0),
      plan: {
        name: subscription.plan.name,
        monthlyPrice: subscription.plan.monthlyPrice,
      },
    };
  }

  async getUsageForecast(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: {
        plan: true,
        billingCycles: {
          orderBy: { startDate: 'desc' },
          take: 3,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.billingCycles.length < 2) {
      return {
        forecast: null,
        message: 'Insufficient data to generate forecast',
      };
    }

    // Calculate average usage from last 2 cycles
    const lastTwoCycles = subscription.billingCycles.slice(0, 2);
    const avgUsagePerCycle: Record<string, number> = {};

    for (const cycle of lastTwoCycles) {
      const usageRecords = await this.prisma.usageRecord.findMany({
        where: { billingCycleId: cycle.id },
      });

      for (const record of usageRecords) {
        if (!avgUsagePerCycle[record.usageType]) {
          avgUsagePerCycle[record.usageType] = 0;
        }
        avgUsagePerCycle[record.usageType] += record.totalCost;
      }
    }

    // Calculate forecast for next cycle
    const forecast = {
      estimatedUsageCost: Object.values(avgUsagePerCycle).reduce(
        (a, b) => a + (b / lastTwoCycles.length),
        0,
      ),
      planBaseCost: subscription.plan.monthlyPrice,
      estimatedTotalCost:
        subscription.plan.monthlyPrice +
        Object.values(avgUsagePerCycle).reduce(
          (a, b) => a + (b / lastTwoCycles.length),
          0,
        ),
      breakdown: avgUsagePerCycle,
    };

    return { forecast };
  }

  async getUserUsageStats(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: {
        billingCycles: true,
      },
    });

    const allUsageRecords = await this.prisma.usageRecord.findMany({
      where: {
        userId,
      },
    });

    const stats = {
      totalUsageCost: allUsageRecords.reduce((sum, r) => sum + r.totalCost, 0),
      recordCount: allUsageRecords.length,
      usageByType: this.groupUsageByType(allUsageRecords),
      activeSubscriptions: subscriptions.filter(
        (s) => s.status === 'ACTIVE',
      ).length,
    };

    return stats;
  }

  // ==================== HELPERS ====================
  private getUnitForUsageType(type: UsageType): string {
    const units: Record<UsageType, string> = {
      AI_TOKENS: 'tokens',
      AGENTS: 'tasks',
      DEPLOYMENTS: 'deployments',
      STORAGE: 'GB',
      API_CALLS: 'calls',
      REPO_INDEXING: 'repos',
      APP_GENERATION: 'apps',
    };
    return units[type] || 'units';
  }

  private getUsageLimitForPlan(plan: any, usageType: UsageType): number | null {
    const limits: Record<UsageType, keyof typeof plan> = {
      AI_TOKENS: 'aiTokenLimit',
      AGENTS: 'maxAgents',
      DEPLOYMENTS: 'maxDeployments',
      STORAGE: 'storageGb',
      API_CALLS: 'maxApiCalls',
      REPO_INDEXING: 'maxProjects',
      APP_GENERATION: 'maxProjects',
    };

    return plan[limits[usageType]] || null;
  }

  private groupUsageByType(records: any[]) {
    return records.reduce((acc, record) => {
      if (!acc[record.usageType]) {
        acc[record.usageType] = {
          quantity: 0,
          cost: 0,
        };
      }
      acc[record.usageType].quantity += record.quantity;
      acc[record.usageType].cost += record.totalCost;
      return acc;
    }, {} as Record<string, any>);
  }
}
