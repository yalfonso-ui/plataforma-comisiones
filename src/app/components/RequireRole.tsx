import { Navigate } from "react-router";
import { useAppStore } from "../store/appStore";
import { can, type Permission } from "../auth/permissions";

interface RequireRoleProps {
  permission: Permission;
  children: React.ReactNode;
}

/**
 * Guard de permisos: si el usuario no tiene el permiso requerido,
 * redirige a /resumen.
 *
 * Uso:
 *   <RequireRole permission="cartera:approve"><CarteraPage /></RequireRole>
 */
export function RequireRole({ permission, children }: RequireRoleProps) {
  const role = useAppStore((s) => s.user?.rol);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!can(permission, role)) {
    return <Navigate to="/resumen" replace />;
  }

  return <>{children}</>;
}
