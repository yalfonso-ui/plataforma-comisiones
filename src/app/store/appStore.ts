// ============================================================
// App Store — Zustand + localStorage
// Migrado: roles RBAC, estados de factura, fiscal colombiano,
// archivos reales en base64
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppRole } from "../auth/permissions";
import { MOCK_USERS } from "../auth/mockUsers";
import { DEMO_AGENCIAS } from "../auth/mockAgencias";
import type { FiscalSnapshot, FileAttachment, InvoiceStatus, Agencia } from "../types/domain";

// ============================================================
// Types
// ============================================================

type OpStatus = "pendiente" | "pendiente-recaudo" | "disponible" | "confirmado";

export interface Operation {
  id: string;
  voucher: string;
  fecha: string;
  plan: string;
  valor: number;
  status: OpStatus;
  porcentaje?: number;
  base?: number;
  nivel?: string;
  comision?: number;
  agenciaId?: string;
}

export interface Invoice {
  id: string;
  fecha: string;
  vouchers: string[];
  totalComision: number;
  totalLiquidado: number;
  xmlFileName: string;
  pdfFileName: string;
  status: InvoiceStatus;
  rfc?: string;
  razonSocial?: string;
  folioFiscal?: string;
  rechazadaMotivo?: string;
  // Nuevos campos
  agenciaId?: string;
  fiscal?: FiscalSnapshot;
  xmlFile?: FileAttachment;
  pdfFile?: FileAttachment;
  archivosValidados?: boolean;
  fechaAprobacionCartera?: string;
  fechaAprobacionComisiones?: string;
  fechaDispersión?: string;
}

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  rol: AppRole;
  nivel: string;
  /** Datos bancarios del usuario para el archivo de dispersión. */
  banco?: string;
  clabe?: string;
  cuenta?: string;
  /** Tipo de identificación (CC, NIT, RFC, etc.). */
  tipoIdentificacion?: string;
  /** Número de identificación fiscal. */
  numeroIdentificacion?: string;
}

export interface Notification {
  id: string;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  href?: string;
}

// ============================================================
// Demo Data
// ============================================================

const DEMO_OPERATIONS: Operation[] = [
  { id: "1", voucher: "VCH-2026-001", fecha: "2026-08-25", plan: "Plan Premium", valor: 18500, status: "pendiente", porcentaje: 12.5, base: 148000, nivel: "Nivel 1", comision: 18500, agenciaId: "age-1" },
  { id: "2", voucher: "VCH-2026-002", fecha: "2026-08-24", plan: "Plan Básico", valor: 9200, status: "pendiente-recaudo", porcentaje: 10.0, base: 92000, nivel: "Nivel 1", comision: 9200, agenciaId: "age-1" },
  { id: "3", voucher: "VCH-2026-003", fecha: "2026-08-23", plan: "Plan Enterprise", valor: 35000, status: "confirmado", porcentaje: 15.0, base: 233333, nivel: "Nivel 2", comision: 35000, agenciaId: "age-2" },
  { id: "4", voucher: "VCH-2026-004", fecha: "2026-08-22", plan: "Plan Premium", valor: 16700, status: "disponible", porcentaje: 12.5, base: 133600, nivel: "Nivel 1", comision: 16700, agenciaId: "age-1" },
  { id: "5", voucher: "VCH-2026-005", fecha: "2026-08-21", plan: "Plan Básico", valor: 8800, status: "disponible", porcentaje: 10.0, base: 88000, nivel: "Nivel 1", comision: 8800, agenciaId: "age-2" },
  { id: "6", voucher: "VCH-2026-006", fecha: "2026-08-20", plan: "Plan Premium", valor: 14500, status: "disponible", porcentaje: 15.0, base: 96667, nivel: "Nivel 2", comision: 14500, agenciaId: "age-3" },
  { id: "7", voucher: "VCH-2026-007", fecha: "2026-08-19", plan: "Plan Premium", valor: 21000, status: "disponible", porcentaje: 12.5, base: 168000, nivel: "Nivel 1", comision: 21000, agenciaId: "age-1" },
  { id: "8", voucher: "VCH-2026-008", fecha: "2026-08-18", plan: "Plan Enterprise", valor: 42000, status: "pendiente", porcentaje: 16.0, base: 262500, nivel: "Nivel 3", comision: 42000, agenciaId: "age-3" },
  { id: "9", voucher: "VCH-2026-009", fecha: "2026-08-17", plan: "Plan Básico", valor: 9500, status: "disponible", porcentaje: 10.0, base: 95000, nivel: "Nivel 1", comision: 9500, agenciaId: "age-2" },
  { id: "10", voucher: "VCH-2026-010", fecha: "2026-08-16", plan: "Plan Premium", valor: 17800, status: "pendiente-recaudo", porcentaje: 12.5, base: 142400, nivel: "Nivel 1", comision: 17800, agenciaId: "age-1" },
  { id: "11", voucher: "VCH-2026-011", fecha: "2026-08-15", plan: "Plan Enterprise", valor: 38000, status: "disponible", porcentaje: 14.0, base: 271429, nivel: "Nivel 2", comision: 38000, agenciaId: "age-3" },
  { id: "12", voucher: "VCH-2026-012", fecha: "2026-08-14", plan: "Plan Premium", valor: 15200, status: "disponible", porcentaje: 12.5, base: 121600, nivel: "Nivel 1", comision: 15200, agenciaId: "age-2" },
  { id: "13", voucher: "VCH-2026-013", fecha: "2026-08-13", plan: "Plan Básico", valor: 10500, status: "disponible", porcentaje: 10.0, base: 105000, nivel: "Nivel 1", comision: 10500, agenciaId: "age-1" },
  { id: "14", voucher: "VCH-2026-014", fecha: "2026-08-12", plan: "Plan Enterprise", valor: 45000, status: "disponible", porcentaje: 17.5, base: 257143, nivel: "Nivel 3", comision: 45000, agenciaId: "age-3" },
  { id: "15", voucher: "VCH-2026-015", fecha: "2026-08-11", plan: "Plan Premium", valor: 19800, status: "pendiente", porcentaje: 12.5, base: 158400, nivel: "Nivel 1", comision: 19800, agenciaId: "age-2" },
  { id: "16", voucher: "VCH-2026-016", fecha: "2026-08-10", plan: "Plan Básico", valor: 7800, status: "pendiente-recaudo", porcentaje: 10.0, base: 78000, nivel: "Nivel 1", comision: 7800, agenciaId: "age-1" },
  { id: "17", voucher: "VCH-2026-017", fecha: "2026-08-09", plan: "Plan Premium", valor: 22500, status: "confirmado", porcentaje: 15.0, base: 150000, nivel: "Nivel 2", comision: 22500, agenciaId: "age-2" },
  { id: "18", voucher: "VCH-2026-018", fecha: "2026-08-08", plan: "Plan Enterprise", valor: 52000, status: "confirmado", porcentaje: 18.0, base: 288889, nivel: "Nivel 3", comision: 52000, agenciaId: "age-3" },
  { id: "19", voucher: "VCH-2026-019", fecha: "2026-08-07", plan: "Plan Premium", valor: 13500, status: "confirmado", porcentaje: 12.5, base: 108000, nivel: "Nivel 1", comision: 13500, agenciaId: "age-1" },
  { id: "20", voucher: "VCH-2026-020", fecha: "2026-08-06", plan: "Plan Básico", valor: 8900, status: "confirmado", porcentaje: 10.0, base: 89000, nivel: "Nivel 1", comision: 8900, agenciaId: "age-2" },
  { id: "21", voucher: "VCH-2026-021", fecha: "2026-08-05", plan: "Plan Enterprise", valor: 48000, status: "confirmado", porcentaje: 17.5, base: 274286, nivel: "Nivel 3", comision: 48000, agenciaId: "age-3" },
  { id: "22", voucher: "VCH-2026-022", fecha: "2026-08-04", plan: "Plan Premium", valor: 16500, status: "confirmado", porcentaje: 13.0, base: 126923, nivel: "Nivel 1", comision: 16500, agenciaId: "age-1" },
  { id: "23", voucher: "VCH-2026-023", fecha: "2026-08-03", plan: "Plan Básico", valor: 8200, status: "confirmado", porcentaje: 10.0, base: 82000, nivel: "Nivel 1", comision: 8200, agenciaId: "age-2" },
  { id: "24", voucher: "VCH-2026-024", fecha: "2026-08-02", plan: "Plan Premium", valor: 19200, status: "confirmado", porcentaje: 12.5, base: 153600, nivel: "Nivel 1", comision: 19200, agenciaId: "age-3" },
  { id: "25", voucher: "VCH-2026-025", fecha: "2026-08-01", plan: "Plan Enterprise", valor: 55000, status: "confirmado", porcentaje: 18.0, base: 305556, nivel: "Nivel 3", comision: 55000, agenciaId: "age-1" },
];

const DEMO_INVOICES: Invoice[] = [
  {
    id: "INV-001", fecha: "2026-08-20",
    vouchers: ["VCH-2026-017", "VCH-2026-018"],
    totalComision: 74500, totalLiquidado: 67050,
    xmlFileName: "factura-001.xml", pdfFileName: "factura-001.pdf",
    // agenciaId debe ser el del primer voucher para mantener coherencia
    // con la regla aplicada en buildInvoice() al crear nuevas facturas.
    status: "aprobada_cartera", agenciaId: "age-2", // VCH-2026-017 → age-2 ✓
    rfc: "GARM850312AB1", razonSocial: "María García López",
    folioFiscal: "F9B17E2A-3C4D-4E5F-89A0-1B2C3D4E5F6G",
  },
  {
    id: "INV-002", fecha: "2026-08-15",
    vouchers: ["VCH-2026-019", "VCH-2026-020", "VCH-2026-021"],
    totalComision: 76400, totalLiquidado: 68760,
    xmlFileName: "factura-002.xml", pdfFileName: "factura-002.pdf",
    status: "aprobada_cartera", agenciaId: "age-1", // VCH-2026-019 → age-1 ✓
    rfc: "GARM850312AB1", razonSocial: "María García López",
    folioFiscal: "A2C83F19-7B6E-4D2C-A1B3-9F8E7D6C5B4A",
  },
  {
    id: "INV-003", fecha: "2026-08-10",
    vouchers: ["VCH-2026-022", "VCH-2026-023"],
    totalComision: 35700, totalLiquidado: 32130,
    xmlFileName: "factura-003.xml", pdfFileName: "factura-003.pdf",
    status: "en_cartera", agenciaId: "age-1", // VCH-2026-022 → age-1 ✓ (antes decía age-3)
    rfc: "GARM850312AB1", razonSocial: "María García López",
    folioFiscal: "3D4E5F6G-7H8I-9J0K-1L2M-3N4O5P6Q7R8S",
  },
  {
    id: "INV-004", fecha: "2026-08-05",
    vouchers: ["VCH-2026-024", "VCH-2026-025"],
    totalComision: 74200, totalLiquidado: 66780,
    xmlFileName: "factura-004.xml", pdfFileName: "factura-004.pdf",
    status: "rechazada", agenciaId: "age-3", // VCH-2026-024 → age-3 ✓ (antes decía age-2)
    rfc: "GARM850312AB1", razonSocial: "María García López",
    folioFiscal: "8S7R6Q5P-4O3N-2M1L-0K9J-8I7H6G5F4E3D",
    rechazadaMotivo: "Los archivos XML y PDF no corresponden al mismo comprobante.",
  },
];

const DEMO_USER: AuthUser = {
  name: "María García López",
  email: "maria.garcia@continental.com",
  initials: "MG",
  rol: "comercial",
  nivel: "Comercial Senior",
  banco: "BBVA",
  clabe: "012180001234567890",
  cuenta: "1234567890",
  tipoIdentificacion: "CC",
  numeroIdentificacion: "79123456",
};

/** Configuración fiscal inicial — fuente de verdad para resetData(). */
const DEFAULT_CONFIG: AppState["config"] = {
  tasaRetefuenteJuridica: 0.04,
  tasaRetefuenteNatural: 0.10,
  tasaReteICA: 0,
  aplicarISRPorDefecto: false,
  ivaColombia: 0.19,
  razonSocialEmisor: "Continental Seguros SA",
  nitEmisor: "860.002.134-1",
};

// ============================================================
// Store
// ============================================================

interface AppState {
  operations: Operation[];
  invoices: Invoice[];
  agencias: Agencia[];
  config: {
    tasaRetefuenteJuridica: number;
    tasaRetefuenteNatural: number;
    tasaReteICA: number;
    aplicarISRPorDefecto: boolean;
    ivaColombia: number;
    razonSocialEmisor: string;
    nitEmisor: string;
  };
  availableOperationsCount: number;
  user: AuthUser | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  notifications: Notification[];
  lastLogin: string | null;

  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: AppRole) => void;

  // Operations
  updateOperationStatus: (voucher: string, status: OpStatus) => void;

  // Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, motivo?: string) => void;
  markInvoiceDispersed: (id: string) => void;

  // Agencias
  addAgencia: (agencia: Omit<Agencia, "id">) => void;
  updateAgencia: (id: string, agencia: Partial<Agencia>) => void;
  deleteAgencia: (id: string) => void;

  // Config
  updateConfig: (config: Partial<AppState["config"]>) => void;

  // UI
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  resetData: () => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<Notification, "id" | "fecha" | "leida">) => void;
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Genera el set inicial de notificaciones según el rol.
 * Cada rol arranca con sus alertas contextuales (un comercial no ve
 * "tienes facturas pendientes de aprobar" y viceversa).
 */
function seedNotifications(role: AppRole): Notification[] {
  const now = new Date().toISOString();
  switch (role) {
    case "comercial":
      return [
        {
          id: uid(),
          tipo: "success",
          titulo: "Vouchers disponibles para facturar",
          mensaje: "Tienes operaciones listas. Ve a la sección Facturar para emitir tu factura del periodo.",
          fecha: now,
          leida: false,
          href: "/facturar",
        },
        {
          id: uid(),
          tipo: "warning",
          titulo: "Pagos pendientes de confirmación",
          mensaje: "Todavía tienes vouchers que requieren que confirmes el pago con tu comprobante bancario.",
          fecha: now,
          leida: false,
          href: "/mi-cartera",
        },
      ];
    case "cartera":
      return [
        {
          id: uid(),
          tipo: "info",
          titulo: "Facturas pendientes de revisión",
          mensaje: "Tienes facturas radicadas esperando tu aprobación. Revisa el módulo de Cartera.",
          fecha: now,
          leida: false,
          href: "/cartera",
        },
        {
          id: uid(),
          tipo: "warning",
          titulo: "Rechazo con motivo pendiente",
          mensaje: "Una factura fue rechazada. Verifica el motivo antes de reenviar.",
          fecha: now,
          leida: false,
          href: "/historial",
        },
      ];
    case "comisiones":
      return [
        {
          id: uid(),
          tipo: "info",
          titulo: "Facturas listas para dispersión",
          mensaje: "Ya puedes revisar las facturas aprobadas por Cartera y programar la dispersión.",
          fecha: now,
          leida: false,
          href: "/comisiones",
        },
      ];
    case "super_admin":
      return [
        {
          id: uid(),
          tipo: "info",
          titulo: "Panel de administración",
          mensaje: "Gestiona agencias, usuarios y la configuración global del sistema desde aquí.",
          fecha: now,
          leida: false,
          href: "/agencias",
        },
      ];
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      operations: DEMO_OPERATIONS,
      invoices: DEMO_INVOICES,
      agencias: DEMO_AGENCIAS,
      config: DEFAULT_CONFIG,
      availableOperationsCount: DEMO_OPERATIONS.filter(op => op.status === "disponible").length,
      user: DEMO_USER,
      isAuthenticated: false,
      onboardingCompleted: false,
      lastLogin: null,
      notifications: seedNotifications("comercial"),

      // ============================================================
      // AUTH
      // ============================================================

      login: async (email, password) => {
        await new Promise(r => setTimeout(r, 600));

        // Buscar en la tabla mock
        const mockUser = MOCK_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!mockUser) return false;

        const now = new Date().toISOString();
        set({
          isAuthenticated: true,
          user: {
            name: mockUser.name,
            email: mockUser.email,
            initials: mockUser.initials,
            rol: mockUser.rol,
            nivel: mockUser.nivel,
            banco: mockUser.banco,
            clabe: mockUser.clabe,
            cuenta: mockUser.cuenta,
            tipoIdentificacion: mockUser.tipoIdentificacion,
            numeroIdentificacion: mockUser.numeroIdentificacion,
          },
          lastLogin: now,
        });
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      switchRole: (role) => {
        const currentUser = get().user;
        if (!currentUser) return;
        // No-op si ya está en el rol activo (evita re-renders innecesarios).
        if (currentUser.rol === role) return;

        // Buscar el mock correspondiente al nuevo rol para encapsular
        // toda la identidad (nombre, email, avatar, nivel). Esto evita
        // la inconsistencia cognitiva de ver "cartera@continental.com"
        // con el nombre de María García.
        const mockUser = MOCK_USERS.find((u) => u.rol === role);
        if (!mockUser) return;

        set({
          user: {
            ...currentUser,
            rol: role,
            name: mockUser.name,
            email: mockUser.email,
            initials: mockUser.initials,
            nivel: mockUser.nivel,
            // Copiar también los datos bancarios para que el archivo de
            // dispersión use los del rol activo.
            banco: mockUser.banco,
            clabe: mockUser.clabe,
            cuenta: mockUser.cuenta,
            tipoIdentificacion: mockUser.tipoIdentificacion,
            numeroIdentificacion: mockUser.numeroIdentificacion,
          },
          // Limpiar notificaciones: las del rol anterior ya no aplican
          // (ej: "tienes vouchers pendientes" no le habla al analista
          // de Comisiones). Cada rol arranca con sus propias alertas demo.
          notifications: seedNotifications(role),
        });
      },

      // ============================================================
      // OPERATIONS
      // ============================================================

      updateOperationStatus: (voucher, status) => {
        let prevStatus: OpStatus | null = null;
        const updatedOperations = get().operations.map((op) => {
          if (op.voucher === voucher) {
            prevStatus = op.status;
            return { ...op, status };
          }
          return op;
        });
        const availableCount = updatedOperations.filter(op => op.status === "disponible").length;

        if (prevStatus && prevStatus !== status) {
          const transitions: Record<string, string> = {
            "pendiente->confirmado": "Pago confirmado correctamente",
            "confirmado->disponible": "Recaudo confirmado, listo para facturar",
            "pendiente-recaudo->disponible": "Recaudo confirmado, listo para facturar",
          };
          const key = `${prevStatus}->${status}`;
          if (transitions[key]) {
            get().pushNotification({
              tipo: "success",
              titulo: "Estado actualizado",
              mensaje: transitions[key],
              href: status === "disponible" ? "/facturar" : "/cartera",
            });
          }
        }

        set({
          operations: updatedOperations,
          availableOperationsCount: availableCount,
        });
      },

      // ============================================================
      // INVOICES
      // ============================================================

      addInvoice: (invoice: Invoice) => {
        set((state) => ({
          invoices: [invoice, ...state.invoices],
          operations: state.operations.map(op =>
            invoice.vouchers.includes(op.voucher)
              ? { ...op, status: "confirmado" as OpStatus }
              : op
          ),
          availableOperationsCount: state.operations.filter(
            (op) => !invoice.vouchers.includes(op.voucher) && op.status === "disponible"
          ).length,
        }));
        get().pushNotification({
          tipo: "info",
          titulo: "Factura enviada a Cartera",
          mensaje: `${invoice.id} está en proceso de revisión por Cartera.`,
          href: "/historial",
        });
      },

      updateInvoiceStatus: (id, status, motivo) => {
        set((state) => ({
          invoices: state.invoices.map(inv => {
            if (inv.id !== id) return inv;
            const updated: Invoice = {
              ...inv,
              status,
              rechazadaMotivo: motivo ?? inv.rechazadaMotivo,
            };
            // Auto-llenar fechas de aprobación
            if (status === "aprobada_cartera") {
              updated.fechaAprobacionCartera = new Date().toISOString();
            } else if (status === "aprobada_comisiones") {
              updated.fechaAprobacionComisiones = new Date().toISOString();
            }
            return updated;
          }),
        }));

        const messages: Record<InvoiceStatus, string> = {
          en_cartera: "La factura está pendiente de aprobación por Cartera.",
          aprobada_cartera: "La factura fue aprobada por Cartera y pasó a Comisiones.",
          en_comisiones: "La factura está pendiente de aprobación por Comisiones.",
          aprobada_comisiones: "La factura fue aprobada por Comisiones. Lista para dispersión.",
          dispersada: "El pago fue dispersado exitosamente.",
          rechazada: motivo ?? "La factura fue rechazada.",
          rechazada_cartera: motivo ?? "La factura fue rechazada por Cartera.",
          rechazada_comisiones: motivo ?? "La factura fue rechazada por Comisiones.",
        };

        get().pushNotification({
          tipo: status.includes("rechazada") ? "error" : "success",
          titulo: `Factura ${id}`,
          mensaje: messages[status],
          href: "/historial",
        });
      },

      markInvoiceDispersed: (id) => {
        set((state) => ({
          invoices: state.invoices.map(inv =>
            inv.id === id
              ? { ...inv, status: "dispersada" as InvoiceStatus, fechaDispersión: new Date().toISOString() }
              : inv
          ),
        }));
        get().pushNotification({
          tipo: "success",
          titulo: "Pago dispersado",
          mensaje: `La factura ${id} fue marcada como dispersada.`,
          href: "/historial",
        });
      },

      // ============================================================
      // UI
      // ============================================================

      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),

      // ============================================================
      // AGENCIAS (CRUD)
      // ============================================================

      addAgencia: (agencia) => {
        const newAgencia: Agencia = {
          ...agencia,
          id: `age-${Date.now()}`,
        };
        set((state) => ({ agencias: [...state.agencias, newAgencia] }));
        get().pushNotification({
          tipo: "success",
          titulo: "Agencia creada",
          mensaje: `${agencia.nombre} fue agregada al catálogo.`,
          href: "/agencias",
        });
      },

      updateAgencia: (id, updates) => {
        set((state) => ({
          agencias: state.agencias.map(a => a.id === id ? { ...a, ...updates } : a),
        }));
      },

      deleteAgencia: (id) => {
        set((state) => ({
          agencias: state.agencias.map(a => a.id === id ? { ...a, activa: false } : a),
        }));
        get().pushNotification({
          tipo: "info",
          titulo: "Agencia desactivada",
          mensaje: "La agencia fue marcada como inactiva.",
          href: "/agencias",
        });
      },

      // ============================================================
      // CONFIG
      // ============================================================

      updateConfig: (updates) => {
        set((state) => ({ config: { ...state.config, ...updates } }));
        get().pushNotification({
          tipo: "success",
          titulo: "Configuración actualizada",
          mensaje: "Los cambios se aplicarán al próximo cálculo fiscal.",
        });
      },

      resetData: () => {
        // Reset TOTAL: restaura operaciones, facturas, agencias y
        // configuración a su estado de fábrica. Evita estados
        // inconsistentes donde, por ejemplo, agencias quedan
        // marcadas como inactivas y rompen relaciones con facturas.
        const currentRole = get().user?.rol ?? "comercial";
        set({
          operations: DEMO_OPERATIONS,
          invoices: DEMO_INVOICES,
          agencias: DEMO_AGENCIAS,
          config: DEFAULT_CONFIG,
          availableOperationsCount: DEMO_OPERATIONS.filter((op) => op.status === "disponible").length,
          // Restaurar también las notificaciones del rol activo.
          notifications: seedNotifications(currentRole),
        });
      },

      // ============================================================
      // NOTIFICATIONS
      // ============================================================

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, leida: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, leida: true })),
        }));
      },

      pushNotification: (n) => {
        const notif: Notification = { ...n, id: uid(), fecha: new Date().toISOString(), leida: false };
        set((state) => ({
          notifications: [notif, ...state.notifications].slice(0, 50),
        }));
      },
    }),
    {
      name: "continental-comisiones",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        operations: state.operations,
        invoices: state.invoices,
        agencias: state.agencias,
        config: state.config,
        availableOperationsCount: state.availableOperationsCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
        notifications: state.notifications,
        lastLogin: state.lastLogin,
      }),
      migrate: (persistedState) => {
        return persistedState as AppState;
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          try { localStorage.removeItem("continental-comisiones"); } catch {}
          console.warn("[store] No se pudo rehidratar el estado:", error);
        }
      },
    }
  )
);
