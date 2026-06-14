import { create } from 'zustand';
import { repositoriesApi } from '@/lib/repositories-api';
import { Repository, CreateRepositoryPayload } from '@/types/repository';

interface RepositoryStore {
  repositories: Repository[];
  activeRepository: Repository | null;
  isLoading: boolean;
  error: string | null;

  fetchRepositories: () => Promise<void>;
  fetchRepository: (repoId: string) => Promise<void>;
  importRepository: (payload: CreateRepositoryPayload) => Promise<Repository>;
  setActiveRepository: (repo: Repository | null) => void;
  deleteRepository: (repoId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useRepositoryStore = create<RepositoryStore>((set) => ({
  repositories: [],
  activeRepository: null,
  isLoading: false,
  error: null,

  fetchRepositories: async () => {
    set({ isLoading: true, error: null });
    try {
      const repos = await repositoriesApi.getRepositories();
      set({ repositories: repos });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch repositories' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRepository: async (repoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const repo = await repositoriesApi.getRepository(repoId);
      set({ activeRepository: repo });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch repository' });
    } finally {
      set({ isLoading: false });
    }
  },

  importRepository: async (payload: CreateRepositoryPayload) => {
    set({ isLoading: true, error: null });
    try {
      const newRepo = await repositoriesApi.importRepository(payload);
      set((state) => ({
        repositories: [newRepo, ...state.repositories],
        activeRepository: newRepo,
      }));
      return newRepo;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to import repository' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveRepository: (repo) => {
    set({ activeRepository: repo });
  },

  deleteRepository: async (repoId: string) => {
    try {
      await repositoriesApi.deleteRepository(repoId);
      set((state) => ({
        repositories: state.repositories.filter((r) => r.id !== repoId),
        activeRepository: state.activeRepository?.id === repoId ? null : state.activeRepository,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete repository' });
      throw error;
    }
  },

  setError: (error) => {
    set({ error });
  },
}));
