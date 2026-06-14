import { create } from 'zustand';
import { CreditWallet, CreditTransaction } from '@/types/billing';
import { creditApi } from '@/services/credit-api';

interface CreditStore {
  wallet: CreditWallet | null;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;

  fetchWallet: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  addCredit: (amount: number, reason: string) => Promise<void>;
  deductCredit: (amount: number, reason: string, referenceId?: string) => Promise<void>;
  checkBalance: (amount: number) => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
  wallet: null,
  transactions: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const wallet = await creditApi.getBalance();
      set({ wallet });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (limit?: number) => {
    set({ isLoading: true });
    try {
      const transactions = await creditApi.getHistory(limit);
      set({ transactions });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCredit: async (amount: number, reason: string) => {
    try {
      await creditApi.addCredit(amount, reason);
      await get().fetchWallet();
      await get().fetchTransactions();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deductCredit: async (amount: number, reason: string, referenceId?: string) => {
    try {
      await creditApi.deductCredit(amount, reason, referenceId);
      await get().fetchWallet();
      await get().fetchTransactions();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  checkBalance: async (amount: number) => {
    try {
      const result = await creditApi.checkBalance(amount);
      return result.hasBalance;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));