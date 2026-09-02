// ============================================================
// Catálogo mock de agencias colombianas
// ============================================================

import type { Agencia } from "../types/domain";

export const DEMO_AGENCIAS: Agencia[] = [
  {
    id: "age-1",
    nombre: "Viva Vacations",
    pais: "CO",
    codigoEVA: "VIVA-CO",
    contactoEmail: "blanca.arenas@vivavacations.co",
    activa: true,
  },
  {
    id: "age-2",
    nombre: "Viajes y Turismo SA",
    pais: "CO",
    codigoEVA: "VYT-CO",
    contactoEmail: "contacto@viajesyturismoco.com",
    activa: true,
  },
  {
    id: "age-3",
    nombre: "Aventura Colombia",
    pais: "CO",
    codigoEVA: "AVC-CO",
    contactoEmail: "ops@aventuracolombia.co",
    activa: true,
  },
];
