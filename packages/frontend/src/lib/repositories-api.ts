import { apiClient } from './api-client';
import { Repository, CreateRepositoryPayload } from '@/types/repository';

export const repositoriesApi = {
  importRepository: async (payload: CreateRepositoryPayload): Promise<Repository> => {
    const response = await apiClient.post<Repository>('/repos/import', payload);
    return response.data;
  },

  getRepository: async (repoId: string): Promise<Repository> => {
    const response = await apiClient.get<Repository>(`/repos/${repoId}`);
    return response.data;
  },

  getRepositories: async (): Promise<Repository[]> => {
    const response = await apiClient.get<Repository[]>('/repos');
    return response.data;
  },

  getRepositoryStructure: async (repoId: string): Promise<any> => {
    const response = await apiClient.get(`/repos/${repoId}/structure`);
    return response.data;
  },

  getFileContent: async (repoId: string, fileId: string): Promise<any> => {
    const response = await apiClient.get(`/repos/${repoId}/files/${fileId}`);
    return response.data;
  },

  deleteRepository: async (repoId: string): Promise<void> => {
    await apiClient.delete(`/repos/${repoId}`);
  },
};
