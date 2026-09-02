import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUIStore } from "../store/uiStore";

/** Anchos del sidebar (deben coincidir con el `margin-left` que aplica el layout). */
export const SIDEBAR_WIDTHS = {
  collapsed: "w-16", // 64 px → rail con iconos centrados
  expanded: "w-60", // 240 px → drawer con etiquetas (4 items simples)
} as const;

interface CollapsibleSidebarProps {
  /**
   * Contenido del sidebar. Se renderiza en dos modos según el estado
   * del store (`sidebarExpanded`):
   * - Expandido: ancho completo, con textos y acordeones.
   * - Colapsado: solo iconos (el children debe respetar el modo).
   */
  children: (state: { expanded: boolean }) => ReactNode;
  /** Etiqueta ARIA del landmark. Por defecto: "Menú lateral". */
  ariaLabel?: string;
  /**
   * Si true, el sidebar NO usa `fixed top-16`: fluye dentro de su
   * contenedor padre (típico del off-canvas móvil < md). En este modo
   * el sidebar está siempre expandido y el trigger flotante se oculta.
   */
  embedded?: boolean;
}

/**
 * Sidebar persistente colapsable que vive debajo de la Navbar fija.
 *
 * Jerarquía del layout (ver DashboardLayout):
 *  - Navbar superior:    sticky top-0  z-30  h-16
 *  - Sidebar:            fixed  top-16 z-10  h-[calc(100vh-4rem)]
 *  - Contenido principal: margin-left dinámico (ml-16 / ml-72)
 *
 * Estados:
 *  - Rail (colapsado):  w-16   → iconos centrados, oculta textos y acordeones.
 *  - Drawer (expandido): w-72 → iconos + etiquetas + acordeones.
 *
 * Transición:
 *  - `transition-[width] duration-300 ease-in-out` cambia w-16 ↔ w-60
 *    de forma fluida. El contenido interno usa `transition-opacity`
 *    para los textos que aparecen/desaparecen.
 *
 * Trigger flotante:
 *  - Botón circular sutil anclado al borde superior derecho del sidebar
 *    (`absolute -right-2 top-5`). Apenas asoma 8px del borde, evitando
 *    competir visualmente con los nav items.
 *  - Estilo neutro (border gris, sin shadow) — descubrible en hover
 *    pero discreto por defecto.
 *  - Flecha `<` cuando está expandido (invita a colapsar) y `>`
 *    cuando está colapsado (invita a expandir).
 *  - Visible solo en breakpoint `md+` para no chocar con mobile.
 */
export function CollapsibleSidebar({
  children,
  ariaLabel = "Menú lateral",
  embedded = false,
}: CollapsibleSidebarProps) {
  const expandedStore = useUIStore((s) => s.sidebarExpanded);
  const toggle = useUIStore((s) => s.toggleSidebar);

  // En modo embedded (off-canvas móvil) forzamos expandido para máximo confort.
  const expanded = embedded ? true : expandedStore;

  // Atajo de teclado: `[` colapsa, `]` expande. Respeta inputs.
  // Solo aplica en modo persistente (no en embedded/off-canvas móvil).
  useEffect(() => {
    if (embedded) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (e.key === "[") {
        e.preventDefault();
        useUIStore.getState().setSidebarExpanded(false);
      } else if (e.key === "]") {
        e.preventDefault();
        useUIStore.getState().setSidebarExpanded(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embedded]);

  const widthClass = expanded ? SIDEBAR_WIDTHS.expanded : SIDEBAR_WIDTHS.collapsed;

  const positionClass = embedded
    ? "relative w-full h-full"
    : "fixed top-16 left-0 z-20 h-[calc(100vh-4rem)]";

  return (
    <aside
      aria-label={ariaLabel}
      aria-expanded={expanded}
      className={[
        positionClass,
        // Ancho dinámico con transición suave.
        widthClass,
        "transition-[width] duration-300 ease-in-out",
        // Apariencia.
        "bg-white border-r border-border-base shadow-sm",
        // Layout interno. SIN overflow-hidden aquí: el botón flotante
        // sobresale del borde derecho y necesitamos que NO se recorte.
        // El control de overflow vive en el <div> interno más abajo.
        "flex flex-col",
      ].join(" ")}
    >
      {/* Contenido del sidebar (Rail / Drawer según expanded).
          En modo persistente: scroll interno (porque el aside tiene altura fija
          calculada del viewport). En modo embedded: el padre ya provee scroll. */}
      <div
        className={
          embedded
            ? "flex-1 min-w-0 overflow-x-hidden"
            : "flex-1 min-w-0 overflow-y-auto overflow-x-hidden"
        }
      >
        {children({ expanded })}
      </div>

      {/* Trigger flotante circular — solo en modo persistente (no embedded)
          y solo en pantallas ≥ md. */}
      {!embedded && (
        <button
          type="button"
          onClick={toggle}
          aria-label={expanded ? "Colapsar menú" : "Expandir menú"}
          aria-expanded={expanded}
          aria-controls="sidebar-content"
          title={expanded ? "Colapsar menú (atajo: [)" : "Expandir menú (atajo: ])"}
          className={[
            "hidden md:flex",
            "absolute top-5 z-50",
            // Botón sutil casi flush con el borde derecho del sidebar.
            // w-7 h-7 = 28px. Con -right-2 (8px afuera) solo asoma
            // ligeramente, dando sensación de "control nativo" sin competir
            // visualmente con los nav items.
            "-right-2",
            "items-center justify-center",
            "w-7 h-7 rounded-full",
            "bg-white border border-border-base",
            "text-text-secondary hover:bg-canvas hover:text-azul-oscuro",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-celeste focus:ring-offset-1",
          ].join(" ")}
        >
          {expanded ? (
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      )}
    </aside>
  );
}
