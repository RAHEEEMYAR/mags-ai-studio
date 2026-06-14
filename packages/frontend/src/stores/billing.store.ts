import { create } from 'zustand';
import {
  Subscription,
  Payment,
  Invoice,
  CreditWallet,
  BillingDashboardData,
} from '@/types/billing';
import { billingApi } from '@/services/billing-api';

interface BillingStore {
  subscription: Subscription | null;
  payments: Payment[];
  invoices: Invoice[];
  creditWallet: CreditWallet | null;
  dashboardData: BillingDashboardData | null;

  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscription: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchCreditWallet: () => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  upgradeSubscription: (newPlanType: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refundPayment: (paymentId: string, reason: string) => Promise<void>;
  downloadInvoice: (invoiceId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useBillingStore = create<BillingStore>((set, get) => ({
  subscription: null,
  payments: [],
  invoices: [],
  creditWallet: null,
  dashboardData: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true });
    try {
      const subscription = await billingApi.getSubscription();
      set({ subscription });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPayments: async () => {
    set({ isLoading: true });
    try {
      const payments = await billingApi.getPaymentHistory();
      set({ payments });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const invoices = await billingApi.getInvoices();
      set({ invoices });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCreditWallet: async () => {
    set({ isLoading: true });
    try {
      const creditWallet = await billingApi.getCreditBalance();
      set({ creditWallet });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [subscription, creditWallet, invoices, payments] = await Promise.all([
        billingApi.getSubscription(),
        billingApi.getCreditBalance(),
        billingApi.getInvoices(),
        billingApi.getPaymentHistory(),
      ]);

      const nextBillingDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : null;

      set({
        dashboardData: {
          subscription,
          creditWallet,
          currentInvoice: invoices?.[0] || null,
          monthlyUsage: null,
          nextBillingDate,
        },
        subscription,
        creditWallet,
        invoices,
        payments,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  upgradeSubscription: async (newPlanType: string) => {
    set({ isLoading: true });
    try {
      const updated = await billingApi.upgradeSubscription(newPlanType);
      set({ subscription: updated });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true });
    try {
      const cancelled = await billingApi.cancelSubscription();
      set({ subscription: cancelled });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  refundPayment: async (paymentId: string, reason: string) => {
    try {
      await billingApi.refundPayment(paymentId, reason);
      await get().fetchPayments();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  downloadInvoice: async (invoiceId: string) => {
    try {
      await billingApi.downloadInvoice(invoiceId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));