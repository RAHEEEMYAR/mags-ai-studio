import { apiClient } from './api-client';
import { Subscription, Payment, Invoice, CreditWallet } from '@/types/billing';

export const billingApi = {
  // Plans
  getPlans: async () => {
    const response = await apiClient.get('/billing/plans');
    return response.data;
  },

  getPlan: async (id: string) => {
    const response = await apiClient.get(`/billing/plans/${id}`);
    return response.data;
  },

  // Subscriptions
  getSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await apiClient.get<Subscription>('/billing/subscription');
      return response.data;
    } catch {
      return null;
    }
  },

  createSubscription: async (planType: string, billingPeriod: string) => {
    const response = await apiClient.post('/billing/subscription/create', {
      planType,
      billingPeriod,
    });
    return response.data;
  },

  upgradeSubscription: async (newPlanType: string) => {
    const response = await apiClient.post('/billing/subscription/upgrade', {
      newPlanType,
    });
    return response.data;
  },

  downgradeSubscription: async (newPlanType: string) => {
    const response = await apiClient.post('/billing/subscription/downgrade', {
      newPlanType,
    });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await apiClient.post('/billing/subscription/cancel', {});
    return response.data;
  },

  // Payments
  createCheckout: async (planType: string, billingPeriod: string) => {
    const response = await apiClient.post('/billing/create-checkout', {
      planType,
      billingPeriod,
      successUrl: `${window.location.origin}/billing/success`,
      cancelUrl: `${window.location.origin}/billing/cancel`,
    });
    return response.data;
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/billing/payments/history');
    return response.data;
  },

  refundPayment: async (paymentId: string, reason: string) => {
    const response = await apiClient.post(`/billing/payments/${paymentId}/refund`, {
      reason,
    });
    return response.data;
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<Invoice[]>('/billing/invoices');
    return response.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/billing/invoices/${id}`);
    return response.data;
  },

  downloadInvoice: async (id: string) => {
    const response = await apiClient.get(`/billing/invoices/${id}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Credits
  getCreditBalance: async (): Promise<CreditWallet> => {
    const response = await apiClient.get<CreditWallet>('/billing/credits/balance');
    return response.data;
  },
};