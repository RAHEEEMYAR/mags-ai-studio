import { apiClient } from './api-client';
import { GeneratedApp, GenerateAppPayload } from '@/types/app';

export const appsApi = {
  generateApp: async (payload: GenerateAppPayload): Promise<GeneratedApp> => {
    const response = await apiClient.post<GeneratedApp>('/apps/generate', payload);
    return response.data;
  },

  getApp: async (appId: string): Promise<GeneratedApp> => {
    const response = await apiClient.get<GeneratedApp>(`/apps/${appId}`);
    return response.data;
  },

  getApps: async (): Promise<GeneratedApp[]> => {
    const response = await apiClient.get<GeneratedApp[]>('/apps');
    return response.data;
  },

  deleteApp: async (appId: string): Promise<void> => {
    await apiClient.delete(`/apps/${appId}`);
  },

  editFile: async (appId: string, fileId: string, content: string): Promise<void> => {
    await apiClient.post(`/apps/${appId}/edit-file`, { fileId, content });
  },
};
