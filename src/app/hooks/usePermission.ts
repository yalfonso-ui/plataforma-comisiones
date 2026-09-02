import { useAppStore } from "../store/appStore";
import { can, type Permission } from "../auth/permissions";

/**
 * Hook que verifica si el usuario actual tiene un permiso específico.
 * Se re-evalúa cuando cambia el usuario (rol) en el store.
 */
export function usePermission(perm: Permission): boolean {
  const role = useAppStore((s) => s.user?.rol);
  return can(perm, role);
}
