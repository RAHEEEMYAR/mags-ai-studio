import { apiClient } from './api-client';

export const analysisApi = {
  explainFile: async (repoId: string, fileId: string): Promise<string> => {
    const response = await apiClient.get<{ explanation: string }>(
      `/repos/${repoId}/intelligence/files/${fileId}/explain`,
    );
    return response.data.explanation;
  },

  summarizeRepository: async (repoId: string): Promise<string> => {
    const response = await apiClient.get<{ summary: string }>(
      `/repos/${repoId}/intelligence/summarize`,
    );
    return response.data.summary;
  },

  findBugs: async (repoId: string, fileId?: string): Promise<any> => {
    const response = await apiClient.post(`/repos/${repoId}/intelligence/find-bugs`, {
      fileId,
    });
    return response.data;
  },

  suggestImprovements: async (repoId: string, fileId: string): Promise<string> => {
    const response = await apiClient.get<{ suggestions: string }>(
      `/repos/${repoId}/intelligence/files/${fileId}/improve`,
    );
    return response.data.suggestions;
  },

  askQuestion: async (repoId: string, question: string): Promise<any> => {
    const response = await apiClient.post(`/repos/${repoId}/intelligence/query`, {
      question,
    });
    return response.data;
  },
};
