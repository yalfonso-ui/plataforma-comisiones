import { NavLink } from "react-router";
import { BarChart2, Coins, Receipt, ScrollText, ShieldCheck, Building2, Users, Settings, type LucideIcon } from "lucide-react";
import { TEXT_SECONDARY } from "../utils/ui";
import { useAppStore } from "../store/appStore";
import { can, type Permission, type AppRole } from "../auth/permissions";

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  badge?: number;
  badgeVariant?: "warning" | "info";
  permisos?: Permission[];
}

/**
 * Items del sidebar — fuente de verdad de las rutas de navegación.
 * Se filtran por permisos del usuario actual.
 *
 * Convenciones de visibilidad:
 *  - "Cartera" (/cartera): comercial confirma pagos + rol Cartera aprueba facturas.
 *    La vista cambia según el rol (ver CarteraRouter en routes.tsx).
 *  - "Comisiones" (/comisiones): rol Comisiones — aprueba y dispersa pagos.
 */
const ALL_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { to: "/resumen", label: "Dashboard", icon: BarChart2, shortcut: "G R" },
  { to: "/cartera", label: "Cartera", icon: Coins, shortcut: "G C", permisos: ["cartera:view", "facturar:view_own"] },
  { to: "/facturar", label: "Facturar", icon: Receipt, shortcut: "G F", permisos: ["facturar:create"] },
  { to: "/historial", label: "Historial", icon: ScrollText, shortcut: "G H" },
  { to: "/comisiones", label: "Comisiones", icon: ShieldCheck, shortcut: "G CM", permisos: ["comisiones:view"] },
  { to: "/agencias", label: "Agencias", icon: Building2, shortcut: "G A", permisos: ["agencias:manage"] },
  { to: "/usuarios", label: "Usuarios", icon: Users, shortcut: "G U", permisos: ["usuarios:manage"] },
  { to: "/config", label: "Configuración", icon: Settings, shortcut: "G CF", permisos: ["config:manage"] },
];

/** Tooltip descriptivo según la ruta y el conteo. */
function badgeTooltip(to: string, count: number): string {
  if (to === "/cartera") {
    return `${count} pendiente${count > 1 ? "s" : ""} de gestionar`;
  }
  if (to === "/facturar") {
    return `${count} comisión${count > 1 ? "es" : ""} disponible${count > 1 ? "s" : ""} para facturar`;
  }
  return `${count} pendiente${count > 1 ? "s" : ""}`;
}

interface SidebarNavProps {
  availableCount: number;
  pendingCount: number;
  collapsed?: boolean;
  listClassName?: string;
  compact?: boolean;
}

/**
 * Nav vertical condicional por rol.
 * Filtra items según los permisos del usuario actual.
 */
export function SidebarNav({
  availableCount,
  pendingCount,
  collapsed = false,
  listClassName = "px-3 space-y-0.5",
  compact = false,
}: SidebarNavProps) {
  const userRole = useAppStore((s) => s.user?.rol) as AppRole | undefined;
  // Conteo de facturas pendientes de aprobación Cartera (en_cartera).
  // Se obtiene del store directamente para que el badge se actualice
  // automáticamente cuando Cartera aprueba/rechaza.
  const pendingInvoicesCount = useAppStore(
    (s) => s.invoices.filter((inv) => inv.status === "en_cartera").length
  );

  // Filtrar items por permisos del usuario
  const visibleItems = ALL_SIDEBAR_ITEMS.filter((item) => {
    if (!item.permisos) return true; // items sin restricción
    return item.permisos.some((perm) => can(perm, userRole));
  });

  // Inyecta badges según el conteo de operaciones pendientes/disponibles
  const items: SidebarNavItem[] = visibleItems.map((it) => {
    if (it.to === "/facturar" && availableCount > 0) {
      return { ...it, badge: availableCount, badgeVariant: "info" as const };
    }
    // El item "Cartera" muestra badge diferente según el rol:
    //   - comercial: vouchers pendientes de confirmar (pendingCount)
    //   - cartera/admin: facturas pendientes de aprobar (pendingInvoicesCount)
    if (it.to === "/cartera") {
      const isComercial = userRole === "comercial";
      const count = isComercial ? pendingCount : pendingInvoicesCount;
      if (count > 0) {
        return { ...it, badge: count, badgeVariant: "warning" as const };
      }
    }
    return it;
  });

  return (
    <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto pt-12 pb-3">
      <ul className={listClassName}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg transition-colors ${
                    compact ? "px-3 py-2" : collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"
                  } ${
                    isActive
                      ? "bg-celeste-soft text-azul-oscuro font-semibold"
                      : `${TEXT_SECONDARY} hover:bg-canvas hover:text-azul-oscuro`
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-celeste"
                      />
                    )}

                    <Icon className="w-5 h-5 flex-shrink-0" />

                    {!collapsed && (
                      <span className="flex-1 text-sm">{item.label}</span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <span
                        title={badgeTooltip(item.to, item.badge)}
                        aria-label={badgeTooltip(item.to, item.badge)}
                        className={`relative text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeVariant === "warning"
                            ? "bg-warning-soft text-warning-border border border-warning-border/30"
                            : "bg-info-soft text-info-border border border-info-border/30"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                        {!compact && (
                          <span
                            aria-hidden="true"
                            className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                              item.badgeVariant === "warning" ? "bg-warning" : "bg-info"
                            }`}
                            style={{ animationDuration: "2.5s" }}
                          />
                        )}
                      </span>
                    )}

                    {collapsed && item.badge !== undefined && (
                      <span
                        title={badgeTooltip(item.to, item.badge)}
                        aria-label={badgeTooltip(item.to, item.badge)}
                        className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center border ${
                          item.badgeVariant === "warning"
                            ? "bg-warning-soft text-warning-border border border-warning-border/30"
                            : "bg-info-soft text-info-border border border-info-border/30"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}

                    {!collapsed && !compact && (
                      <kbd
                        title={`Atajo: ${item.shortcut}`}
                        className="hidden group-hover:inline-flex text-[10px] text-text-secondary/60 font-mono border border-border-base rounded px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    {!compact && collapsed && (
                      <kbd className="sr-only">{item.shortcut}</kbd>
                    )}

                    {isActive && <span className="sr-only">(página actual)</span>}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
