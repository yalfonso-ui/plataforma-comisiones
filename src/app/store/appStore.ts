// Simple state management using custom hooks and context
import { create } from 'zustand';

type Status = "pendiente" | "pendiente-recaudo" | "confirmado" | "disponible";

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
  status: "procesando" | "aprobada" | "rechazada";
}

interface AppState {
  operations: Operation[];
  invoices: Invoice[];
  availableOperationsCount: number;
  updateOperationStatus: (voucher: string, status: Status) => void;
  addInvoice: (invoice: Invoice) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  operations: [
    // Últimos 30 días (Agosto 2026)
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
  ],
  invoices: [
    {
      id: "INV-001",
      fecha: "2026-08-20",
      vouchers: ["VCH-2026-017", "VCH-2026-018"],
      totalComision: 74500,
      totalLiquidado: 67050,
      xmlFileName: "factura-001.xml",
      pdfFileName: "factura-001.pdf",
      status: "aprobada"
    },
    {
      id: "INV-002",
      fecha: "2026-08-15",
      vouchers: ["VCH-2026-019", "VCH-2026-020", "VCH-2026-021"],
      totalComision: 76400,
      totalLiquidado: 68760,
      xmlFileName: "factura-002.xml",
      pdfFileName: "factura-002.pdf",
      status: "aprobada"
    },
    {
      id: "INV-003",
      fecha: "2026-08-10",
      vouchers: ["VCH-2026-022", "VCH-2026-023"],
      totalComision: 35700,
      totalLiquidado: 32130,
      xmlFileName: "factura-003.xml",
      pdfFileName: "factura-003.pdf",
      status: "aprobada"
    },
    {
      id: "INV-004",
      fecha: "2026-08-05",
      vouchers: ["VCH-2026-024", "VCH-2026-025"],
      totalComision: 74200,
      totalLiquidado: 66780,
      xmlFileName: "factura-004.xml",
      pdfFileName: "factura-004.pdf",
      status: "aprobada"
    },
  ],
  availableOperationsCount: 9,
  
  updateOperationStatus: (voucher, status) => {
    set((state) => {
      const updatedOperations = state.operations.map((op) =>
        op.voucher === voucher ? { ...op, status } : op
      );
      const availableCount = updatedOperations.filter(op => op.status === "disponible").length;
      return {
        operations: updatedOperations,
        availableOperationsCount: availableCount,
      };
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
  },
}));