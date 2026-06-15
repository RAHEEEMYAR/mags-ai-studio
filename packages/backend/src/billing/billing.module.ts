import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionService } from './services/subscription.service';
import { PaymentService } from './services/payment.service';
import { InvoiceService } from './services/invoice.service';
import { CreditWalletService } from './services/credit-wallet.service';
import { UsageMeteringService } from './services/usage-metering.service';
import { BillingEngineService } from './services/billing-engine.service';
import { StripeService } from './stripe/stripe.service';
import { StripeWebhookController } from './stripe/stripe-webhook.controller';
import { StripeWebhookService } from './stripe/stripe-webhook.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, RedisModule, ConfigModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [
    BillingService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    CreditWalletService,
    UsageMeteringService,
    BillingEngineService,
    StripeService,
    StripeWebhookService,
  ],
  exports: [
    BillingService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    CreditWalletService,
    UsageMeteringService,
    BillingEngineService,
    StripeService,
  ],
})
export class BillingModule {}
