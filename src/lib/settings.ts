import { create } from "zustand";
import { persist } from "zustand/middleware";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface SettingsState {
  documentPath: string | null;
  setDocumentPath: (path: string) => Promise<void>;
  selectDocumentPath: () => Promise<void>;
  initialized: boolean;
  initializeDocumentPath: () => Promise<void>;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      documentPath: null,
      initialized: false,
      setDocumentPath: async (path: string) => {
        try {
          await invoke("set_document_path", { path });
          set({ documentPath: path });
        } catch (error) {
          console.error("Failed to set document path:", error);
          throw error;
        }
      },
      selectDocumentPath: async () => {
        try {
          const selected = await open({
            directory: true,
            multiple: false,
            defaultPath: get().documentPath || undefined,
          });
          
          if (selected && typeof selected === "string") {
            await get().setDocumentPath(selected);
          }
        } catch (error) {
          console.error("Failed to select directory:", error);
          throw error;
        }
      },
      initializeDocumentPath: async () => {
        if (!get().initialized) {
          try {
            const path = await invoke<string>("get_document_path");
            set({ documentPath: path, initialized: true });
          } catch (error) {
            console.error("Failed to get document path:", error);
            set({ initialized: true });
          }
        }
      },
    }),
    {
      name: "app-settings",
      partialize: (state) => ({ initialized: state.initialized }),
    },
  ),
);

