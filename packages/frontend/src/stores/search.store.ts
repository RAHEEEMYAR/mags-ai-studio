import { create } from 'zustand';
import { searchApi } from '@/lib/search-api';
import { SearchResult, SearchFilters } from '@/types/search';

interface SearchStore {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  setQuery: (query: string) => void;
  search: (repoId: string, query: string, filters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
  setError: (error: string | null) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  isSearching: false,
  error: null,

  setQuery: (query) => {
    set({ query });
  },

  search: async (repoId: string, query: string, filters?: SearchFilters) => {
    set({ isSearching: true, error: null, query });
    try {
      const results = await searchApi.search(repoId, query, filters);
      set({ results });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Search failed' });
    } finally {
      set({ isSearching: false });
    }
  },

  clearResults: () => {
    set({ results: [], query: '' });
  },

  setError: (error) => {
    set({ error });
  },
}));
