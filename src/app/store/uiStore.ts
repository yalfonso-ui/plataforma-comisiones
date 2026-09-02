import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  /**
   * Estado visual del sidebar persistente.
   * - `true`  → drawer expandido (w-72): iconos + etiquetas + acordeones.
   * - `false` → rail colapsado (w-16): solo iconos alineados al centro.
   *
   * Se persiste en localStorage para mantener la preferencia del usuario
   * entre sesiones (espejo del comportamiento Continental IAM).
   */
  sidebarExpanded: boolean;
  /** Alterna entre expandido y colapsado. */
  toggleSidebar: () => void;
  /** Fija explícitamente el estado. */
  setSidebarExpanded: (expanded: boolean) => void;
}

/**
 * Lee el valor legacy (`sidebarCollapsed`) del store anterior para
 * no perder la preferencia del usuario al migrar. La nueva convención
 * es inversa, así que se invierte al mapear.
 */
function readLegacy(): boolean | undefined {
  try {
    const raw = localStorage.getItem("continental-comisiones:sidebar-collapsed/v1");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.state?.sidebarCollapsed === "boolean") {
      // Legacy: collapsed=true → drawer cerrado → nuevo = !true = false (rail).
      return !parsed.state.sidebarCollapsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Default expandido en desktop para primer contacto; rail es opt-in.
      sidebarExpanded: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
    }),
    {
      name: "continental-comisiones:sidebar-collapsed/v1",
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos el flag; evitamos arrastrar accidentalmente
      // futuras props de UI en el mismo namespace.
      partialize: (state) => ({ sidebarExpanded: state.sidebarExpanded }),
      // Migración desde la convención anterior (sidebarCollapsed → sidebarExpanded).
      migrate: (persistedState, _version) => {
        const legacy = persistedState as Partial<UIState> & {
          sidebarCollapsed?: boolean;
        };
        if (typeof legacy?.sidebarExpanded !== "boolean") {
          const fallback = readLegacy();
          return { sidebarExpanded: fallback ?? true } as UIState;
        }
        return legacy as UIState;
      },
      version: 2,
    }
  )
);
