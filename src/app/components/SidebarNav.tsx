import { NavLink } from "react-router";
import { FileText, Clock, CheckCircle2, Calendar } from "lucide-react";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: typeof FileText;
  shortcut: string;
  badge?: number;
  badgeVariant?: "warning" | "info";
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { to: "/resumen", label: "Resumen", icon: Calendar, shortcut: "G R" },
  { to: "/cartera", label: "Cartera", icon: Clock, shortcut: "G C" },
  { to: "/facturar", label: "Facturar", icon: FileText, shortcut: "G F" },
  { to: "/historial", label: "Historial", icon: CheckCircle2, shortcut: "G H" },
];

interface SidebarNavProps {
  availableCount: number;
  pendingCount: number;
  /** Cuando true, muestra solo íconos centrados (modo colapsado). */
  collapsed?: boolean;
  /** Clase extra para el <ul> (p. ej. padding). */
  listClassName?: string;
  /** Renderizado compacto para el drawer móvil. */
  compact?: boolean;
}

/**
 * Nav vertical compartido entre el sidebar desktop y el drawer móvil.
 * Estilo alineado a Continental IAM: ítem activo con fondo suave + barra
 * celeste indicadora a la izquierda; badges de pendientes/disponibles.
 */
export function SidebarNav({
  availableCount,
  pendingCount,
  collapsed = false,
  listClassName = "px-3 space-y-1",
  compact = false,
}: SidebarNavProps) {
  const items: SidebarNavItem[] = SIDEBAR_NAV_ITEMS.map((it) => {
    if (it.to === "/facturar" && availableCount > 0) {
      return { ...it, badge: availableCount, badgeVariant: "info" as const };
    }
    if (it.to === "/cartera" && pendingCount > 0) {
      return { ...it, badge: pendingCount, badgeVariant: "warning" as const };
    }
    return it;
  });

  return (
    <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto py-4">
      <ul className={listClassName}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg transition-colors ${
                  compact ? "px-3 py-3" : collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-celeste-soft text-azul-oscuro font-semibold"
                    : `${TEXT_SECONDARY} hover:bg-canvas hover:text-azul-oscuro`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Barra indicadora (estilo IAM) */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-celeste"
                    />
                  )}

                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 text-sm">{item.label}</span>}

                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeVariant === "warning"
                          ? "bg-warning-soft text-warning-border border border-warning-border/30"
                          : "bg-info-soft text-info-border border border-info-border/30"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}

                  {/* Badge compacto cuando está colapsado */}
                  {collapsed && item.badge !== undefined && (
                    <span
                      className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${
                        item.badgeVariant === "warning"
                          ? "bg-warning text-azul-oscuro"
                          : "bg-info text-white"
                      }`}
                      aria-label={`${item.badge} pendiente${item.badge > 1 ? "s" : ""}`}
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}

                  {!collapsed && (
                    <kbd className="hidden text-[10px] text-text-secondary/60 font-mono border border-border-base rounded px-1.5">
                      {item.shortcut}
                    </kbd>
                  )}

                  {isActive && <span className="sr-only">(página actual)</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
