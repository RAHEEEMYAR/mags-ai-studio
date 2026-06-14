import { apiClient } from './api-client';

export const deploymentApi = {
  deploy: async (appId: string, provider: string): Promise<{ deploymentId: string }> => {
    const response = await apiClient.post<{ deploymentId: string }>(
      `/apps/${appId}/deploy`,
      { provider },
    );
    return response.data;
  },

  getDeploymentStatus: async (appId: string): Promise<any> => {
    const response = await apiClient.get(`/apps/${appId}/deployment-status`);
    return response.data;
  },
};
