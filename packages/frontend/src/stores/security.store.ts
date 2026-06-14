import { create } from 'zustand';
import { securityApi } from '@/lib/security-api';
import {
  SecurityEvent,
  Threat,
  AuditLog,
  SecurityRule,
  SessionLog,
  AnomalyScore,
} from '@/types/security';

interface SecurityStore {
  // State
  recentEvents: SecurityEvent[];
  threats: Threat[];
  auditLogs: AuditLog[];
  rules: SecurityRule[];
  activeSessions: SessionLog[];
  anomalyScores: Map<string, AnomalyScore>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRecentEvents: () => Promise<void>;
  fetchThreats: () => Promise<void>;
  fetchAuditLogs: (filters?: any) => Promise<void>;
  fetchRules: () => Promise<void>;
  fetchActiveSessions: () => Promise<void>;
  createRule: (rule: Partial<SecurityRule>) => Promise<void>;
  updateRule: (ruleId: string, updates: Partial<SecurityRule>) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  blockUser: (userId: string, duration: number) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useSecurityStore = create<SecurityStore>((set) => ({
  recentEvents: [],
  threats: [],
  auditLogs: [],
  rules: [],
  activeSessions: [],
  anomalyScores: new Map(),
  isLoading: false,
  error: null,

  fetchRecentEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const events = await securityApi.getSecurityEvents();
      set({ recentEvents: events });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchThreats: async () => {
    try {
      const threats = await securityApi.getThreats();
      set({ threats });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchAuditLogs: async (filters?: any) => {
    try {
      const logs = await securityApi.getAuditLogs(filters);
      set({ auditLogs: logs });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchRules: async () => {
    try {
      const rules = await securityApi.getRules();
      set({ rules });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchActiveSessions: async () => {
    try {
      const sessions = await securityApi.getActiveSessions();
      set({ activeSessions: sessions });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createRule: async (rule) => {
    try {
      const newRule = await securityApi.createRule(rule);
      set((state) => ({
        rules: [newRule, ...state.rules],
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateRule: async (ruleId, updates) => {
    try {
      const updated = await securityApi.updateRule(ruleId, updates);
      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? updated : r)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteRule: async (ruleId) => {
    try {
      await securityApi.deleteRule(ruleId);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  blockUser: async (userId, duration) => {
    try {
      await securityApi.blockUser(userId, duration);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      await securityApi.unblockUser(userId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setError: (error) => {
    set({ error });
  },
}));