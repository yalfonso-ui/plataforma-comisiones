// ============================================================
// RBAC — Roles y Permisos
// ============================================================

export type AppRole = "comercial" | "cartera" | "comisiones" | "super_admin";

export type Permission =
  | "cartera:view"
  | "cartera:approve"
  | "cartera:reject"
  | "comisiones:view"
  | "comisiones:approve"
  | "comisiones:dispersar"
  | "facturar:create"
  | "facturar:view_own"
  | "facturar:view_all"
  | "agencias:manage"
  | "usuarios:manage"
  | "config:manage"
  | "export:excel";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  comercial: [
    "facturar:create",
    "facturar:view_own",
    "cartera:view",
  ],
  cartera: [
    "cartera:view",
    "cartera:approve",
    "cartera:reject",
  ],
  comisiones: [
    "comisiones:view",
    "comisiones:approve",
    "comisiones:dispersar",
  ],
  super_admin: [
    "cartera:view",
    "cartera:approve",
    "cartera:reject",
    "comisiones:view",
    "comisiones:approve",
    "comisiones:dispersar",
    "facturar:create",
    "facturar:view_own",
    "facturar:view_all",
    "agencias:manage",
    "usuarios:manage",
    "config:manage",
    "export:excel",
  ],
};

export function can(perm: Permission, role?: AppRole): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

// Metadata de roles para el Role Switcher
export const ROLE_META: Record<AppRole, { label: string; descripcion: string }> = {
  comercial: {
    label: "Comercial",
    descripcion: "Gestión de comisiones propias y facturación directa",
  },
  cartera: {
    label: "Cartera",
    descripcion: "Aprobación de facturas y gestión de pagos a comerciales",
  },
  comisiones: {
    label: "Comisiones",
    descripcion: "Validación final, aprobación y dispersión de pagos",
  },
  super_admin: {
    label: "Super Admin",
    descripcion: "Control total y supervisión transversal de todos los módulos",
  },
};
