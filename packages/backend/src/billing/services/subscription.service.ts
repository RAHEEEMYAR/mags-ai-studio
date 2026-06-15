import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { UsageMeteringService } from './usage-metering.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private usageMeteringService: UsageMeteringService,
    private invoiceService: InvoiceService,
  ) {}

  async getUserSubscription(userId: string) {
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

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return subscription;
  }

  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'MONTHLY' | 'YEARLY',
    stripeSubscriptionId?: string,
  ) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        billingCycle,
        status: 'ACTIVE',
        stripeSubscriptionId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(new Date(), billingCycle),
      },
      include: { plan: true },
    });

    // Initialize credit wallet
    await this.prisma.creditWallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    });

    return subscription;
  }

  async upgradePlan(userId: string, newPlanId: string) {
    const subscription = await this.getUserSubscription(userId);
    const newPlan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    if (subscription.planId === newPlanId) {
      throw new BadRequestException('Already on this plan');
    }

    // Calculate proration
    const prorationData = await this.calculateProration(
      subscription,
      newPlan,
      'upgrade',
    );

    // Update subscription
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlanId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(
          new Date(),
          subscription.billingCycle,
        ),
      },
      include: { plan: true },
    });

    // Create billing cycle with proration
    await this.prisma.billingCycle.create({
      data: {
        subscriptionId: subscription.id,
        planId: newPlanId,
        startDate: new Date(),
        endDate: this.calculatePeriodEnd(
          new Date(),
          subscription.billingCycle,
        ),
        cycleNumber: await this.getNextCycleNumber(subscription.id),
        baseAmount: newPlan.monthlyPrice,
        prorationAmount: prorationData.prorationAmount,
        prorationReason: 'UPGRADE',
        totalAmount:
          newPlan.monthlyPrice +
          (prorationData.creditAmount || 0) +
          prorationData.prorationAmount,
        status: 'ACTIVE',
      },
    });

    // Sync with Stripe if connected
    if (subscription.stripeSubscriptionId) {
      await this.stripeService.updateSubscriptionPlan(
        subscription.stripeSubscriptionId,
        newPlanId,
      );
    }

    return updated;
  }

  async downgradePlan(userId: string, newPlanId: string) {
    const subscription = await this.getUserSubscription(userId);
    const newPlan = await this.prisma.plan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    if (subscription.planId === newPlanId) {
      throw new BadRequestException('Already on this plan');
    }

    const currentPlan = subscription.plan;
    if (newPlan.monthlyPrice > currentPlan.monthlyPrice) {
      throw new BadRequestException(
        'Use upgrade endpoint for higher-tier plans',
      );
    }

    // Calculate proration
    const prorationData = await this.calculateProration(
      subscription,
      newPlan,
      'downgrade',
    );

    // Queue downgrade for end of billing cycle
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlanId,
      },
      include: { plan: true },
    });

    // Create billing cycle with credit
    await this.prisma.billingCycle.create({
      data: {
        subscriptionId: subscription.id,
        planId: newPlanId,
        startDate: subscription.currentPeriodEnd || new Date(),
        endDate: this.calculatePeriodEnd(
          subscription.currentPeriodEnd || new Date(),
          subscription.billingCycle,
        ),
        cycleNumber: await this.getNextCycleNumber(subscription.id),
        baseAmount: newPlan.monthlyPrice,
        prorationAmount: -prorationData.prorationAmount, // Credit
        prorationReason: 'DOWNGRADE',
        totalAmount:
          newPlan.monthlyPrice -
          (prorationData.creditAmount || 0) +
          prorationData.prorationAmount,
        status: 'ACTIVE',
      },
    });

    if (subscription.stripeSubscriptionId) {
      await this.stripeService.updateSubscriptionPlan(
        subscription.stripeSubscriptionId,
        newPlanId,
      );
    }

    return updated;
  }

  async cancelSubscription(userId: string, reason?: string) {
    const subscription = await this.getUserSubscription(userId);

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: reason,
        canceledBy: 'user',
      },
    });

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
      );
    }

    return updated;
  }

  async resumeSubscription(userId: string) {
    const subscription = await this.getUserSubscription(userId);

    if (subscription.status !== 'CANCELED') {
      throw new BadRequestException('Subscription is not canceled');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        canceledAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(
          new Date(),
          subscription.billingCycle,
        ),
      },
    });

    // Resume in Stripe
    if (subscription.stripeSubscriptionId) {
      await this.stripeService.resumeSubscription(
        subscription.stripeSubscriptionId,
      );
    }

    return updated;
  }

  // ==================== HELPERS ====================
  private calculatePeriodEnd(
    startDate: Date,
    billingCycle: 'MONTHLY' | 'YEARLY',
  ): Date {
    const endDate = new Date(startDate);
    if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  private async calculateProration(
    subscription: any,
    newPlan: any,
    type: 'upgrade' | 'downgrade',
  ) {
    const now = new Date();
    const periodEnd = subscription.currentPeriodEnd || new Date();
    const totalDaysInPeriod = Math.ceil(
      (periodEnd.getTime() - (subscription.currentPeriodStart as Date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const remainingDays = Math.ceil(
      (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const currentPlan = subscription.plan;
    const currentDailyRate = currentPlan.monthlyPrice / totalDaysInPeriod;
    const newDailyRate = newPlan.monthlyPrice / totalDaysInPeriod;

    const creditedAmount = currentDailyRate * remainingDays;
    const newAmount = newDailyRate * remainingDays;

    return {
      prorationAmount: newAmount - creditedAmount,
      creditAmount: creditedAmount,
    };
  }

  private async getNextCycleNumber(subscriptionId: string): Promise<number> {
    const lastCycle = await this.prisma.billingCycle.findFirst({
      where: { subscriptionId },
      orderBy: { cycleNumber: 'desc' },
    });

    return (lastCycle?.cycleNumber || 0) + 1;
  }
}
