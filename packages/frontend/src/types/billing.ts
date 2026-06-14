export type PlanType = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
export type BillingPeriod = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED' | 'PAUSED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    chatTokensPerMonth: number;
    agentExecutionsPerMonth: number;
    appsPerMonth: number;
    deploymentsPerMonth: number;
    analyticsRetentionDays: number;
    customDomain: boolean;
    priority: boolean;
    apiAccess: boolean;
  };
  active: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  failureReason?: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  taxAmount: number;
  status: PaymentStatus;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: Date;
}

export interface CreditWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT' | 'REFUND';
  reason: string;
  referenceId?: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface UsageStats {
  totalUsage: number;
  totalCost: number;
  byType: Record<string, { quantity: number; cost: number }>;
}

export interface BillingDashboardData {
  subscription: Subscription | null;
  creditWallet: CreditWallet | null;
  currentInvoice: Invoice | null;
  monthlyUsage: UsageStats | null;
  nextBillingDate: Date | null;
}