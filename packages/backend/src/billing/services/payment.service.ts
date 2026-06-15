import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutDto,
  ) {
    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get plan
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Determine price
    const amount =
      dto.billingCycle === 'YEARLY' && plan.yearlyPrice
        ? plan.yearlyPrice
        : plan.monthlyPrice;

    // Create payment intent via Stripe
    const session = await this.stripeService.createCheckoutSession({
      customerId: user.email,
      email: dto.email || user.email,
      planId: dto.planId,
      amount,
      billingCycle: dto.billingCycle,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    });

    return {
      sessionId: session.id,
      url: session.url,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async createPayment(
    userId: string,
    subscriptionId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethodId: string,
  ) {
    const idempotencyKey = uuid();

    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId,
        userId,
        amount,
        currency,
        paymentMethod: 'card',
        status: 'PENDING',
        idempotencyKey,
      },
    });

    try {
      // Create payment intent in Stripe
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customerId: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email || '',
        idempotencyKey,
      });

      // Update payment with Stripe data
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      return {
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      // Mark as failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: error.message,
          failedAt: new Date(),
        },
      });

      throw error;
    }
  }

  async processPaymentSuccess(
    paymentIntentId: string,
    chargeId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        stripeChargeId: chargeId,
      },
    });

    return updated;
  }

  async processPaymentFailure(
    paymentIntentId: string,
    reason: string,
    code?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: reason,
        failureCode: code,
      },
    });
  }

  async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Refund in Stripe
    if (payment.stripeChargeId) {
      await this.stripeService.refundCharge(
        payment.stripeChargeId,
        Math.round(payment.amount * 100),
      );
    }

    // Update payment
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount: payment.amount,
        refundReason: reason,
      },
    });
  }

  async getUserPaymentHistory(
    userId: string,
    limit: number,
    offset: number,
  ) {
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          subscription: {
            select: { plan: true },
          },
        },
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      payments,
      total,
      limit,
      offset,
    };
  }
}
