import { create } from 'zustand';
import { AppFile } from '@/types/app';

interface EditorStore {
  openFiles: AppFile[];
  activeFileId: string | null;
  fileContent: Map<string, string>;
  unsavedChanges: Set<string>;
  isEditing: boolean;

  openFile: (file: AppFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  discardChanges: (fileId: string) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  openFiles: [],
  activeFileId: null,
  fileContent: new Map(),
  unsavedChanges: new Set(),
  isEditing: false,

  openFile: (file) => {
    set((state) => {
      if (!state.openFiles.find((f) => f.id === file.id)) {
        return {
          openFiles: [...state.openFiles, file],
          activeFileId: file.id,
          fileContent: new Map(state.fileContent).set(file.id, file.content),
        };
      }
      return { activeFileId: file.id };
    });
  },

  closeFile: (fileId) => {
    set((state) => {
      const newOpenFiles = state.openFiles.filter((f) => f.id !== fileId);
      const newFileContent = new Map(state.fileContent);
      newFileContent.delete(fileId);
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(fileId);

      return {
        openFiles: newOpenFiles,
        activeFileId: newOpenFiles[0]?.id || null,
        fileContent: newFileContent,
        unsavedChanges: newUnsavedChanges,
      };
    });
  },

  setActiveFile: (fileId) => {
    set({ activeFileId: fileId });
  },

  updateFileContent: (fileId, content) => {
    set((state) => {
      const newFileContent = new Map(state.fileContent);
      newFileContent.set(fileId, content);
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.add(fileId);

      return {
        fileContent: newFileContent,
        unsavedChanges: newUnsavedChanges,
      };
    });
  },

  saveFile: async (fileId) => {
    // Save file API call would go here
    set((state) => {
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(fileId);
      return { unsavedChanges: newUnsavedChanges };
    });
  },

  discardChanges: (fileId) => {
    set((state) => {
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(fileId);
      return { unsavedChanges: newUnsavedChanges };
    });
  },

  setIsEditing: (isEditing) => {
    set({ isEditing });
  },
}));
