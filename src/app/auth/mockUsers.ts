// ============================================================
// Mock Users — Usuarios de demostración por rol
// Cada perfil encapsula su propia identidad bancaria para que el
// archivo de dispersión (ACH) refleje datos coherentes.
// ============================================================

import type { AppRole } from "./permissions";

export interface MockUser {
  email: string;
  password: string;
  name: string;
  initials: string;
  rol: AppRole;
  nivel: string;
  // Datos bancarios (para dispersión de pagos).
  banco: string;
  clabe: string;
  cuenta: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    email: "maria.garcia@continental.com",
    password: "demo",
    name: "María García López",
    initials: "MG",
    rol: "comercial",
    nivel: "Comercial Senior",
    banco: "BBVA",
    clabe: "012180001234567890",
    cuenta: "1234567890",
    tipoIdentificacion: "CC",
    numeroIdentificacion: "79123456",
  },
  {
    email: "cartera@continental.com",
    password: "demo",
    name: "Andrea Ramírez",
    initials: "AR",
    rol: "cartera",
    nivel: "Analista de Cartera",
    banco: "Bancolombia",
    clabe: "023001234567890123",
    cuenta: "02345678901",
    tipoIdentificacion: "CC",
    numeroIdentificacion: "52987654",
  },
  {
    email: "comisiones@continental.com",
    password: "demo",
    name: "Luis Torres",
    initials: "LT",
    rol: "comisiones",
    nivel: "Analista de Comisiones",
    banco: "Davivienda",
    clabe: "051001234567890123",
    cuenta: "05123456789",
    tipoIdentificacion: "CC",
    numeroIdentificacion: "80123456",
  },
  {
    email: "admin@continental.com",
    password: "demo",
    name: "Sistemas Admin",
    initials: "SA",
    rol: "super_admin",
    nivel: "Admin TI",
    banco: "Banorte",
    clabe: "072180001234567890",
    cuenta: "07234567890",
    tipoIdentificacion: "NIT",
    numeroIdentificacion: "900123456",
  },
];
