import { create } from 'zustand';
import { appsApi } from '@/lib/apps-api';
import { GeneratedApp, GenerateAppPayload } from '@/types/app';

interface GenerationStore {
  apps: GeneratedApp[];
  activeApp: GeneratedApp | null;
  isGenerating: boolean;
  generationProgress: number;
  currentStep: string | null;
  error: string | null;

  generateApp: (payload: GenerateAppPayload) => Promise<GeneratedApp>;
  fetchApps: () => Promise<void>;
  fetchApp: (appId: string) => Promise<void>;
  setActiveApp: (app: GeneratedApp | null) => void;
  deleteApp: (appId: string) => Promise<void>;
  setGenerationProgress: (progress: number, step: string) => void;
  setError: (error: string | null) => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  apps: [],
  activeApp: null,
  isGenerating: false,
  generationProgress: 0,
  currentStep: null,
  error: null,

  generateApp: async (payload: GenerateAppPayload) => {
    set({ isGenerating: true, error: null, generationProgress: 0 });
    try {
      const app = await appsApi.generateApp(payload);
      set((state) => ({
        apps: [app, ...state.apps],
        activeApp: app,
      }));
      return app;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate app';
      set({ error: message });
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  fetchApps: async () => {
    try {
      const apps = await appsApi.getApps();
      set({ apps });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch apps' });
    }
  },

  fetchApp: async (appId: string) => {
    try {
      const app = await appsApi.getApp(appId);
      set({ activeApp: app });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch app' });
    }
  },

  setActiveApp: (app) => {
    set({ activeApp: app });
  },

  deleteApp: async (appId: string) => {
    try {
      await appsApi.deleteApp(appId);
      set((state) => ({
        apps: state.apps.filter((a) => a.id !== appId),
        activeApp: state.activeApp?.id === appId ? null : state.activeApp,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete app' });
      throw error;
    }
  },

  setGenerationProgress: (progress, step) => {
    set({ generationProgress: progress, currentStep: step });
  },

  setError: (error) => {
    set({ error });
  },
}));
