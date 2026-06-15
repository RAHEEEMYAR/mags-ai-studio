import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from './services/subscription.service';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { CreditWalletService } from './services/credit-wallet.service';
import { UsageMeteringService } from './services/usage-metering.service';
import { BillingEngineService } from './services/billing-engine.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { AddCreditsDto } from './dto/add-credits.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService,
    private creditWalletService: CreditWalletService,
    private usageMeteringService: UsageMeteringService,
    private billingEngineService: BillingEngineService,
  ) {}

  // ==================== PLANS ====================
  async getActivePlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        monthlyPrice: true,
        yearlyPrice: true,
        setupFee: true,
        features: true,
        maxUsers: true,
        maxProjects: true,
        aiTokenLimit: true,
        supportLevel: true,
        isPopular: true,
        isFeatured: true,
      },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async getPlanDetails(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return plan;
  }

  // ==================== SUBSCRIPTION ====================
  async getUserSubscription(userId: string) {
    return this.subscriptionService.getUserSubscription(userId);
  }

  async createCheckoutSession(userId: string, dto: CreateCheckoutDto) {
    return this.paymentService.createCheckoutSession(userId, dto);
  }

  async upgradePlan(userId: string, planId: string) {
    return this.subscriptionService.upgradePlan(userId, planId);
  }

  async downgradePlan(userId: string, planId: string) {
    return this.subscriptionService.downgradePlan(userId, planId);
  }

  async cancelSubscription(userId: string, reason?: string) {
    return this.subscriptionService.cancelSubscription(userId, reason);
  }

  async resumeSubscription(userId: string) {
    return this.subscriptionService.resumeSubscription(userId);
  }

  // ==================== CREDITS ====================
  async getCreditBalance(userId: string) {
    return this.creditWalletService.getBalance(userId);
  }

  async getCreditHistory(userId: string, limit: number, offset: number) {
    return this.creditWalletService.getTransactionHistory(userId, limit, offset);
  }

  async addCredits(userId: string, dto: AddCreditsDto) {
    return this.creditWalletService.addCredits(userId, dto);
  }

  async deductCredits(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string,
  ) {
    return this.creditWalletService.deductCredits(
      userId,
      amount,
      reason,
      referenceId,
    );
  }

  // ==================== INVOICES ====================
  async getInvoices(userId: string, filterDto: InvoiceFilterDto) {
    return this.invoiceService.getUserInvoices(userId, filterDto);
  }

  async getInvoiceDetails(userId: string, invoiceId: string) {
    return this.invoiceService.getInvoiceDetails(userId, invoiceId);
  }

  async downloadInvoice(userId: string, invoiceId: string) {
    return this.invoiceService.generatePdfUrl(userId, invoiceId);
  }

  // ==================== USAGE ====================
  async getCurrentUsage(userId: string) {
    return this.usageMeteringService.getCurrentCycleUsage(userId);
  }

  async getUsageForecast(userId: string) {
    return this.usageMeteringService.getUsageForecast(userId);
  }

  // ==================== BILLING HISTORY ====================
  async getPaymentHistory(userId: string, limit: number, offset: number) {
    return this.paymentService.getUserPaymentHistory(userId, limit, offset);
  }

  async getBillingCycles(userId: string, limit: number, offset: number) {
    return this.billingEngineService.getUserBillingCycles(userId, limit, offset);
  }

  // ==================== BILLING OPERATIONS ====================
  async generateBillingCycle(subscriptionId: string) {
    return this.billingEngineService.generateBillingCycle(subscriptionId);
  }

  async processSubscriptionRenewal(subscriptionId: string) {
    return this.billingEngineService.processSubscriptionRenewal(subscriptionId);
  }

  async calculateUsageBasedCharges(billingCycleId: string) {
    return this.billingEngineService.calculateUsageCharges(billingCycleId);
  }
}
