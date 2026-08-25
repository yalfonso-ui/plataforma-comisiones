import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useUIStore } from "../store/uiStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SidebarNav } from "./SidebarNav";
import logoContinental from "../../assets/Logo continental.png";
import { BORDER_DEFAULT, BG_CANVAS, TEXT_SECONDARY } from "../utils/ui";

/**
 * Sidebar izquierdo (desktop). Blanco, colapsable, con logo arriba,
 * nav vertical compartido y chip de usuario al fondo. Espejo de IAM.
 */
export function Sidebar() {
  const operations = useAppStore((s) => s.operations);
  const user = useAppStore((s) => s.user);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const availableCount = operations.filter((op) => op.status === "disponible").length;
  const pendingCount = operations.filter((op) => op.status === "pendiente").length;

  return (
    <aside
      className={`hidden lg:flex flex-col sticky top-0 h-screen bg-white border-r border-border-base transition-[width] duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header: logo + toggle */}
      <div
        className={`flex items-center h-16 px-4 border-b border-border-base ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 flex items-center justify-center">
              <ImageWithFallback
                src={logoContinental}
                alt="Logo Continental"
                className="h-9 w-auto object-contain"
              />
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          className={`p-2 rounded-lg text-azul-oscuro hover:bg-canvas transition-colors ${
            collapsed ? "" : ""
          }`}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav vertical */}
      <SidebarNav
        availableCount={availableCount}
        pendingCount={pendingCount}
        collapsed={collapsed}
      />

      {/* Footer: chip de usuario */}
      <div className={`mt-auto p-3 border-t border-border-base ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div
            className="w-9 h-9 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-sm"
            title={user?.name ?? "Agente"}
          >
            {user?.initials ?? "AC"}
          </div>
        ) : (
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${BG_CANVAS}`}>
            <div className="w-9 h-9 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.initials ?? "AC"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-azul-oscuro truncate">
                {user?.name ?? "Agente"}
              </p>
              <p className={`text-[11px] ${TEXT_SECONDARY} truncate`}>
                {user?.nivel ?? "Nivel 1 - Comercial"}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
