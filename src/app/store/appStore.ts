// Simple state management using custom hooks and context
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Status = "pendiente" | "pendiente-recaudo" | "disponible" | "confirmado";

export interface Operation {
  id: string;
  voucher: string;
  fecha: string;
  plan: string;
  valor: number;
  status: Status;
  porcentaje?: number;
  base?: number;
  nivel?: string;
  comision?: number;
}

export interface Invoice {
  id: string;
  fecha: string;
  vouchers: string[];
  totalComision: number;
  totalLiquidado: number;
  xmlFileName: string;
  pdfFileName: string;
  xmlContent?: string;
  pdfDataUrl?: string;
  status: "procesando" | "aprobada" | "rechazada";
  rfc?: string;
  razonSocial?: string;
  folioFiscal?: string;
  rechazadaMotivo?: string;
}

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  rol: "comercial" | "supervisor" | "admin";
  nivel: string;
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

const DEMO_OPERATIONS: Operation[] = [
  { id: "1", voucher: "VCH-2026-001", fecha: "2026-08-25", plan: "Plan Premium", valor: 18500, status: "pendiente", porcentaje: 12.5, base: 148000, nivel: "Nivel 1", comision: 18500 },
  { id: "2", voucher: "VCH-2026-002", fecha: "2026-08-24", plan: "Plan Básico", valor: 9200, status: "pendiente-recaudo", porcentaje: 10.0, base: 92000, nivel: "Nivel 1", comision: 9200 },
  { id: "3", voucher: "VCH-2026-003", fecha: "2026-08-23", plan: "Plan Enterprise", valor: 35000, status: "confirmado", porcentaje: 15.0, base: 233333, nivel: "Nivel 2", comision: 35000 },
  { id: "4", voucher: "VCH-2026-004", fecha: "2026-08-22", plan: "Plan Premium", valor: 16700, status: "disponible", porcentaje: 12.5, base: 133600, nivel: "Nivel 1", comision: 16700 },
  { id: "5", voucher: "VCH-2026-005", fecha: "2026-08-21", plan: "Plan Básico", valor: 8800, status: "disponible", porcentaje: 10.0, base: 88000, nivel: "Nivel 1", comision: 8800 },
  { id: "6", voucher: "VCH-2026-006", fecha: "2026-08-20", plan: "Plan Premium", valor: 14500, status: "disponible", porcentaje: 15.0, base: 96667, nivel: "Nivel 2", comision: 14500 },
  { id: "7", voucher: "VCH-2026-007", fecha: "2026-08-19", plan: "Plan Premium", valor: 21000, status: "disponible", porcentaje: 12.5, base: 168000, nivel: "Nivel 1", comision: 21000 },
  { id: "8", voucher: "VCH-2026-008", fecha: "2026-08-18", plan: "Plan Enterprise", valor: 42000, status: "pendiente", porcentaje: 16.0, base: 262500, nivel: "Nivel 3", comision: 42000 },
  { id: "9", voucher: "VCH-2026-009", fecha: "2026-08-17", plan: "Plan Básico", valor: 9500, status: "disponible", porcentaje: 10.0, base: 95000, nivel: "Nivel 1", comision: 9500 },
  { id: "10", voucher: "VCH-2026-010", fecha: "2026-08-16", plan: "Plan Premium", valor: 17800, status: "pendiente-recaudo", porcentaje: 12.5, base: 142400, nivel: "Nivel 1", comision: 17800 },
  { id: "11", voucher: "VCH-2026-011", fecha: "2026-08-15", plan: "Plan Enterprise", valor: 38000, status: "disponible", porcentaje: 14.0, base: 271429, nivel: "Nivel 2", comision: 38000 },
  { id: "12", voucher: "VCH-2026-012", fecha: "2026-08-14", plan: "Plan Premium", valor: 15200, status: "disponible", porcentaje: 12.5, base: 121600, nivel: "Nivel 1", comision: 15200 },
  { id: "13", voucher: "VCH-2026-013", fecha: "2026-08-13", plan: "Plan Básico", valor: 10500, status: "disponible", porcentaje: 10.0, base: 105000, nivel: "Nivel 1", comision: 10500 },
  { id: "14", voucher: "VCH-2026-014", fecha: "2026-08-12", plan: "Plan Enterprise", valor: 45000, status: "disponible", porcentaje: 17.5, base: 257143, nivel: "Nivel 3", comision: 45000 },
  { id: "15", voucher: "VCH-2026-015", fecha: "2026-08-11", plan: "Plan Premium", valor: 19800, status: "pendiente", porcentaje: 12.5, base: 158400, nivel: "Nivel 1", comision: 19800 },
  { id: "16", voucher: "VCH-2026-016", fecha: "2026-08-10", plan: "Plan Básico", valor: 7800, status: "pendiente-recaudo", porcentaje: 10.0, base: 78000, nivel: "Nivel 1", comision: 7800 },
  { id: "17", voucher: "VCH-2026-017", fecha: "2026-08-09", plan: "Plan Premium", valor: 22500, status: "confirmado", porcentaje: 15.0, base: 150000, nivel: "Nivel 2", comision: 22500 },
  { id: "18", voucher: "VCH-2026-018", fecha: "2026-08-08", plan: "Plan Enterprise", valor: 52000, status: "confirmado", porcentaje: 18.0, base: 288889, nivel: "Nivel 3", comision: 52000 },
  { id: "19", voucher: "VCH-2026-019", fecha: "2026-08-07", plan: "Plan Premium", valor: 13500, status: "confirmado", porcentaje: 12.5, base: 108000, nivel: "Nivel 1", comision: 13500 },
  { id: "20", voucher: "VCH-2026-020", fecha: "2026-08-06", plan: "Plan Básico", valor: 8900, status: "confirmado", porcentaje: 10.0, base: 89000, nivel: "Nivel 1", comision: 8900 },
  { id: "21", voucher: "VCH-2026-021", fecha: "2026-08-05", plan: "Plan Enterprise", valor: 48000, status: "confirmado", porcentaje: 17.5, base: 274286, nivel: "Nivel 3", comision: 48000 },
  { id: "22", voucher: "VCH-2026-022", fecha: "2026-08-04", plan: "Plan Premium", valor: 16500, status: "confirmado", porcentaje: 13.0, base: 126923, nivel: "Nivel 1", comision: 16500 },
  { id: "23", voucher: "VCH-2026-023", fecha: "2026-08-03", plan: "Plan Básico", valor: 8200, status: "confirmado", porcentaje: 10.0, base: 82000, nivel: "Nivel 1", comision: 8200 },
  { id: "24", voucher: "VCH-2026-024", fecha: "2026-08-02", plan: "Plan Premium", valor: 19200, status: "confirmado", porcentaje: 12.5, base: 153600, nivel: "Nivel 1", comision: 19200 },
  { id: "25", voucher: "VCH-2026-025", fecha: "2026-08-01", plan: "Plan Enterprise", valor: 55000, status: "confirmado", porcentaje: 18.0, base: 305556, nivel: "Nivel 3", comision: 55000 },
];

const DEMO_INVOICES: Invoice[] = [
  {
    id: "INV-001",
    fecha: "2026-08-20",
    vouchers: ["VCH-2026-017", "VCH-2026-018"],
    totalComision: 74500,
    totalLiquidado: 67050,
    xmlFileName: "factura-001.xml",
    pdfFileName: "factura-001.pdf",
    status: "aprobada",
    rfc: "GARM850312AB1",
    razonSocial: "María García López",
    folioFiscal: "F9B17E2A-3C4D-4E5F-89A0-1B2C3D4E5F6G",
  },
  {
    id: "INV-002",
    fecha: "2026-08-15",
    vouchers: ["VCH-2026-019", "VCH-2026-020", "VCH-2026-021"],
    totalComision: 76400,
    totalLiquidado: 68760,
    xmlFileName: "factura-002.xml",
    pdfFileName: "factura-002.pdf",
    status: "aprobada",
    rfc: "GARM850312AB1",
    razonSocial: "María García López",
    folioFiscal: "A2C83F19-7B6E-4D2C-A1B3-9F8E7D6C5B4A",
  },
  {
    id: "INV-003",
    fecha: "2026-08-10",
    vouchers: ["VCH-2026-022", "VCH-2026-023"],
    totalComision: 35700,
    totalLiquidado: 32130,
    xmlFileName: "factura-003.xml",
    pdfFileName: "factura-003.pdf",
    status: "aprobada",
    rfc: "GARM850312AB1",
    razonSocial: "María García López",
    folioFiscal: "3D4E5F6G-7H8I-9J0K-1L2M-3N4O5P6Q7R8S",
  },
  {
    id: "INV-004",
    fecha: "2026-08-05",
    vouchers: ["VCH-2026-024", "VCH-2026-025"],
    totalComision: 74200,
    totalLiquidado: 66780,
    xmlFileName: "factura-004.xml",
    pdfFileName: "factura-004.pdf",
    status: "aprobada",
    rfc: "GARM850312AB1",
    razonSocial: "María García López",
    folioFiscal: "8S7R6Q5P-4O3N-2M1L-0K9J-8I7H6G5F4E3D",
  },
];

interface AppState {
  operations: Operation[];
  invoices: Invoice[];
  availableOperationsCount: number;
  user: AuthUser | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  notifications: Notification[];
  lastLogin: string | null;
  updateOperationStatus: (voucher: string, status: Status) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"], motivo?: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  resetData: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Omit<Notification, "id" | "fecha" | "leida">) => void;
}

const DEMO_USER: AuthUser = {
  name: "María García López",
  email: "maria.garcia@continental.com",
  initials: "MG",
  rol: "comercial",
  nivel: "Nivel 2 - Comercial Senior",
};

// Generar UUID simple sin dependencia
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      operations: DEMO_OPERATIONS,
      invoices: DEMO_INVOICES,
      availableOperationsCount: 9,
      user: DEMO_USER,
      isAuthenticated: false,
      onboardingCompleted: false,
      lastLogin: null,
      notifications: [
        {
          id: uid(),
          tipo: "info",
          titulo: "Bienvenido a Continental Comisiones",
          mensaje: "Hemos rediseñado la plataforma para ti. Descubre las nuevas funciones disponibles.",
          fecha: new Date().toISOString(),
          leida: false,
        },
        {
          id: uid(),
          tipo: "success",
          titulo: "Vouchers disponibles para facturar",
          mensaje: "Tienes 9 operaciones listas. Ve a la sección Facturar para emitir tu factura del periodo.",
          fecha: new Date().toISOString(),
          leida: false,
          href: "/facturar",
        },
        {
          id: uid(),
          tipo: "warning",
          titulo: "Pagos pendientes de confirmación",
          mensaje: "3 vouchers aún requieren que confirmes el pago con tu comprobante bancario.",
          fecha: new Date().toISOString(),
          leida: false,
          href: "/cartera",
        },
      ],

      updateOperationStatus: (voucher, status) => {
        let prevStatus: Status | null = null;
        const updatedOperations = get().operations.map((op) => {
          if (op.voucher === voucher) {
            prevStatus = op.status;
            return { ...op, status };
          }
          return op;
        });
        const availableCount = updatedOperations.filter(op => op.status === "disponible").length;

        // Auto-generar notificación
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

      addInvoice: (invoice: Invoice) => {
        set((state) => ({
          invoices: [invoice, ...state.invoices],
          operations: state.operations.filter(
            (op) => !invoice.vouchers.includes(op.voucher)
          ),
          availableOperationsCount: state.operations.filter(
            (op) => !invoice.vouchers.includes(op.voucher) && op.status === "disponible"
          ).length,
        }));
        get().pushNotification({
          tipo: "info",
          titulo: "Factura enviada",
          mensaje: `${invoice.id} está en proceso de revisión. Te avisaremos cuando sea aprobada.`,
          href: "/historial",
        });
      },

      updateInvoiceStatus: (id, status, motivo) => {
        set((state) => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, status, rechazadaMotivo: motivo ?? inv.rechazadaMotivo } : inv
          ),
        }));
        const messages: Record<typeof status, string> = {
          aprobada: "Tu factura fue aprobada y el pago será programado.",
          rechazada: motivo ?? "Tu factura fue rechazada. Revisa los detalles en el historial.",
          procesando: "Tu factura sigue en proceso de revisión.",
        };
        get().pushNotification({
          tipo: status === "rechazada" ? "error" : status === "aprobada" ? "success" : "info",
          titulo: `Factura ${id}`,
          mensaje: messages[status],
          href: "/historial",
        });
      },

      login: async (email, password) => {
        // Demo: cualquier email con password >= 4 caracteres funciona
        await new Promise(r => setTimeout(r, 600));
        if (!email.includes("@") || password.length < 4) return false;
        const initials = email
          .split("@")[0]
          .split(/[._-]/)
          .map(p => p[0]?.toUpperCase() ?? "")
          .slice(0, 2)
          .join("");
        const nameFromEmail = email.split("@")[0]
          .split(/[._-]/)
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ");
        const now = new Date().toISOString();
        set({
          isAuthenticated: true,
          user: {
            name: nameFromEmail || "Agente Continental",
            email,
            initials: initials || "AC",
            rol: "comercial",
            nivel: "Nivel 1 - Comercial",
          },
          lastLogin: now,
        });
        return true;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ onboardingCompleted: false }),

      resetData: () => {
        set({
          operations: DEMO_OPERATIONS,
          invoices: DEMO_INVOICES,
          availableOperationsCount: 9,
        });
      },

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
      version: 2, // [FIX] Incrementado para limpiar localStorage tras cambios estructurales
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        operations: state.operations,
        invoices: state.invoices,
        availableOperationsCount: state.availableOperationsCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
        notifications: state.notifications,
        lastLogin: state.lastLogin,
      }),
      // [FIX] Migración segura: si la versión guardada es distinta, reiniciar el estado.
      // Esto evita errores por shape mismatch tras añadir nuevas propiedades al store.
      migrate: (persistedState, version) => {
        // Forzar reset total cuando hay incompatibilidad de versión
        // Devolver undefined hace que zustand use el estado inicial completo
        if (version !== 2) return undefined as unknown as AppState;
        return persistedState as AppState;
      },
      // [FIX] Si la rehidratación falla por cualquier razón, caemos al estado inicial
      // sin lanzar un error que rompa el componente raíz.
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          try { localStorage.removeItem("continental-comisiones"); } catch {}
          console.warn("[store] No se pudo rehidratar el estado:", error);
        }
      },
    }
  )
);
