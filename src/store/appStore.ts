import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  currentProject: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentProject: (projectId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentProject: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentProject: (projectId) => set({ currentProject: projectId }),
}));
