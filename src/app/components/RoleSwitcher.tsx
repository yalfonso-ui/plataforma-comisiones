// ============================================================
// Role Switcher — Cambio rápido de rol (demo)
// Diseñado para vivir dentro del UserMenu dropdown
// ============================================================

import { Shield } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { ROLE_META, type AppRole } from "../auth/permissions";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

const ROLE_ORDER: AppRole[] = ["comercial", "cartera", "comisiones", "super_admin"];

export function RoleSwitcher() {
  const currentRole = useAppStore((s) => s.user?.rol);
  const switchRole = useAppStore((s) => s.switchRole);

  return (
    <div className={`px-4 py-3 border-b ${BORDER_DEFAULT}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-celeste" />
        <span className="text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
          Simular Rol
        </span>
      </div>

      <div className="space-y-1">
        {ROLE_ORDER.map((role) => {
          const meta = ROLE_META[role];
          const isActive = currentRole === role;

          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-celeste-soft border border-celeste-subtle"
                  : `hover:bg-canvas border border-transparent`
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? "border-celeste bg-celeste"
                      : "border-border-base"
                  }`}
                >
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-azul-oscuro" : TEXT_SECONDARY
                    }`}
                  >
                    {meta.label}
                  </p>
                  <p className={`text-xs ${TEXT_SECONDARY} opacity-70 leading-tight mt-0.5`}>
                    {meta.descripcion}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
