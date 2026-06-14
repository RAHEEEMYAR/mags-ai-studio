import { apiClient } from './api-client';
import { SecurityEvent, Threat, AuditLog, SecurityRule } from '@/types/security';

export const securityApi = {
  // Events
  getSecurityEvents: async (): Promise<SecurityEvent[]> => {
    const response = await apiClient.get<SecurityEvent[]>('/security/events');
    return response.data;
  },

  // Threats
  getThreats: async (): Promise<Threat[]> => {
    const response = await apiClient.get<Threat[]>('/security/threats');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (filters?: any): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>('/security/audit-logs', {
      params: filters,
    });
    return response.data;
  },

  exportAuditLogs: async (format: 'csv' | 'json' = 'csv'): Promise<string> => {
    const response = await apiClient.get<string>(
      `/security/audit-logs/export?format=${format}`,
    );
    return response.data;
  },

  // Rules
  getRules: async (): Promise<SecurityRule[]> => {
    const response = await apiClient.get<SecurityRule[]>('/security/rules');
    return response.data;
  },

  createRule: async (rule: Partial<SecurityRule>): Promise<SecurityRule> => {
    const response = await apiClient.post<SecurityRule>('/security/rules', rule);
    return response.data;
  },

  updateRule: async (ruleId: string, updates: Partial<SecurityRule>): Promise<SecurityRule> => {
    const response = await apiClient.put<SecurityRule>(
      `/security/rules/${ruleId}`,
      updates,
    );
    return response.data;
  },

  deleteRule: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/security/rules/${ruleId}`);
  },

  // Admin Actions
  blockUser: async (userId: string, duration: number): Promise<void> => {
    await apiClient.post(`/admin/security/block-user`, {
      userId,
      duration,
    });
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/security/unblock-user`, {
      userId,
    });
  },

  // Sessions
  getActiveSessions: async (): Promise<any[]> => {
    const response = await apiClient.get('/security/sessions');
    return response.data;
  },

  terminateSession: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/security/sessions/${sessionId}/terminate`);
  },
};