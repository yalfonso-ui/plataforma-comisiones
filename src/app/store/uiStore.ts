import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

/**
 * Estado de UI persistente (shell).
 * Espejo de `useSidebar` de Continental IAM: el estado colapsado del sidebar
 * se guarda en localStorage para mantener la preferencia del usuario.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "continental-comisiones:sidebar-collapsed/v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
