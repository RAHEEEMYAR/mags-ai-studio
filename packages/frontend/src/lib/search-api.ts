import { apiClient } from './api-client';
import { SearchResult, SearchFilters } from '@/types/search';

export const searchApi = {
  search: async (
    repoId: string,
    query: string,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> => {
    const response = await apiClient.post<SearchResult[]>(`/repos/${repoId}/search`, {
      query,
      filters,
    });
    return response.data;
  },

  advancedSearch: async (
    repoId: string,
    query: string,
    filters?: SearchFilters,
  ): Promise<SearchResult[]> => {
    const response = await apiClient.post<SearchResult[]>(
      `/repos/${repoId}/search-semantic`,
      { query, filters },
    );
    return response.data;
  },
};
