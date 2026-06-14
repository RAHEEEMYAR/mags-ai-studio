import { apiClient } from './api-client';
import { CreditTransaction } from '@/types/billing';

export const creditApi = {
  getBalance: async () => {
    const response = await apiClient.get('/billing/credits/balance');
    return response.data;
  },

  getHistory: async (limit: number = 100): Promise<CreditTransaction[]> => {
    const response = await apiClient.get<CreditTransaction[]>(
      `/billing/credits/history?limit=${limit}`,
    );
    return response.data;
  },

  addCredit: async (amount: number, reason: string) => {
    const response = await apiClient.post('/billing/credits/add', {
      amount,
      reason,
    });
    return response.data;
  },

  deductCredit: async (
    amount: number,
    reason: string,
    referenceId?: string,
  ) => {
    const response = await apiClient.post('/billing/credits/deduct', {
      amount,
      reason,
      referenceId,
    });
    return response.data;
  },

  checkBalance: async (amount: number) => {
    const response = await apiClient.get(`/billing/credits/check/${amount}`);
    return response.data;
  },
};