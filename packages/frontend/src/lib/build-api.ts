import { apiClient } from './api-client';

export const buildApi = {
  buildApp: async (appId: string): Promise<{ success: boolean; buildId: string }> => {
    const response = await apiClient.post<{ success: boolean; buildId: string }>(
      `/apps/${appId}/build`,
    );
    return response.data;
  },

  getBuildStatus: async (appId: string, buildId: string): Promise<any> => {
    const response = await apiClient.get(`/apps/${appId}/builds/${buildId}`);
    return response.data;
  },
};
