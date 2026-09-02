// ============================================================
// Mock Users — Usuarios de demostración por rol
// ============================================================

import type { AppRole } from "./permissions";

export interface MockUser {
  email: string;
  password: string;
  name: string;
  initials: string;
  rol: AppRole;
  nivel: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    email: "maria.garcia@continental.com",
    password: "demo",
    name: "María García López",
    initials: "MG",
    rol: "comercial",
    nivel: "Comercial Senior",
  },
  {
    email: "cartera@continental.com",
    password: "demo",
    name: "Andrea Ramírez",
    initials: "AR",
    rol: "cartera",
    nivel: "Analista de Cartera",
  },
  {
    email: "comisiones@continental.com",
    password: "demo",
    name: "Luis Torres",
    initials: "LT",
    rol: "comisiones",
    nivel: "Analista de Comisiones",
  },
  {
    email: "admin@continental.com",
    password: "demo",
    name: "Sistemas Admin",
    initials: "SA",
    rol: "super_admin",
    nivel: "Admin TI",
  },
];
