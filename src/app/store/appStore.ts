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
    // Abril 2026 - Mes corrido (más operaciones para el prototipo)
    { id: "1", voucher: "VCH-2026-001", fecha: "2026-04-01", plan: "Plan Premium", valor: 15000, status: "pendiente", porcentaje: 12.5, base: 120000, nivel: "Nivel 1", comision: 15000 },
    { id: "2", voucher: "VCH-2026-002", fecha: "2026-04-01", plan: "Plan Básico", valor: 8500, status: "pendiente-recaudo", porcentaje: 10.0, base: 85000, nivel: "Nivel 1", comision: 8500 },
    { id: "3", voucher: "VCH-2026-003", fecha: "2026-04-01", plan: "Plan Enterprise", valor: 25000, status: "confirmado", porcentaje: 15.0, base: 166667, nivel: "Nivel 2", comision: 25000 },
    { id: "4", voucher: "VCH-2026-004", fecha: "2026-04-01", plan: "Plan Premium", valor: 15000, status: "disponible", porcentaje: 12.5, base: 120000, nivel: "Nivel 1", comision: 15000 },
    { id: "5", voucher: "VCH-2026-005", fecha: "2026-04-01", plan: "Plan Básico", valor: 9200, status: "disponible", porcentaje: 10.0, base: 92000, nivel: "Nivel 1", comision: 9200 },
    { id: "6", voucher: "VCH-2026-006", fecha: "2026-04-01", plan: "Plan Premium", valor: 12000, status: "disponible", porcentaje: 15.0, base: 80000, nivel: "Nivel 2", comision: 12000 },
    { id: "7", voucher: "VCH-2026-007", fecha: "2026-04-01", plan: "Plan Premium", valor: 18750, status: "disponible", porcentaje: 12.5, base: 150000, nivel: "Nivel 1", comision: 18750 },
    { id: "8", voucher: "VCH-2026-008", fecha: "2026-04-01", plan: "Plan Enterprise", valor: 32000, status: "pendiente", porcentaje: 16.0, base: 200000, nivel: "Nivel 3", comision: 32000 },
    { id: "9", voucher: "VCH-2026-009", fecha: "2026-04-01", plan: "Plan Básico", valor: 7500, status: "disponible", porcentaje: 10.0, base: 75000, nivel: "Nivel 1", comision: 7500 },
    { id: "10", voucher: "VCH-2026-010", fecha: "2026-04-01", plan: "Plan Premium", valor: 14200, status: "pendiente-recaudo", porcentaje: 12.5, base: 113600, nivel: "Nivel 1", comision: 14200 },
    { id: "11", voucher: "VCH-2026-011", fecha: "2026-04-01", plan: "Plan Enterprise", valor: 28000, status: "disponible", porcentaje: 14.0, base: 200000, nivel: "Nivel 2", comision: 28000 },
    { id: "101", voucher: "VCH-2026-101", fecha: "2026-04-01", plan: "Plan Premium", valor: 16800, status: "pendiente", porcentaje: 12.5, base: 134400, nivel: "Nivel 1", comision: 16800 },
    { id: "102", voucher: "VCH-2026-102", fecha: "2026-04-01", plan: "Plan Básico", valor: 9500, status: "disponible", porcentaje: 10.0, base: 95000, nivel: "Nivel 1", comision: 9500 },
    
    // Marzo 2026
    { id: "12", voucher: "VCH-2026-012", fecha: "2026-03-28", plan: "Plan Premium", valor: 16500, status: "confirmado", porcentaje: 13.0, base: 126923, nivel: "Nivel 1", comision: 16500 },
    { id: "13", voucher: "VCH-2026-013", fecha: "2026-03-25", plan: "Plan Básico", valor: 9800, status: "pendiente-recaudo", porcentaje: 10.0, base: 98000, nivel: "Nivel 1", comision: 9800 },
    { id: "14", voucher: "VCH-2026-014", fecha: "2026-03-20", plan: "Plan Enterprise", valor: 30000, status: "confirmado", porcentaje: 15.0, base: 200000, nivel: "Nivel 2", comision: 30000 },
    { id: "15", voucher: "VCH-2026-015", fecha: "2026-03-15", plan: "Plan Premium", valor: 13500, status: "confirmado", porcentaje: 12.5, base: 108000, nivel: "Nivel 1", comision: 13500 },
    { id: "16", voucher: "VCH-2026-016", fecha: "2026-03-10", plan: "Plan Básico", valor: 8200, status: "confirmado", porcentaje: 10.0, base: 82000, nivel: "Nivel 1", comision: 8200 },
    
    // Febrero 2026
    { id: "17", voucher: "VCH-2026-017", fecha: "2026-02-25", plan: "Plan Enterprise", valor: 35000, status: "confirmado", porcentaje: 17.5, base: 200000, nivel: "Nivel 3", comision: 35000 },
    { id: "18", voucher: "VCH-2026-018", fecha: "2026-02-20", plan: "Plan Premium", valor: 15800, status: "confirmado", porcentaje: 13.0, base: 121538, nivel: "Nivel 1", comision: 15800 },
    { id: "19", voucher: "VCH-2026-019", fecha: "2026-02-15", plan: "Plan Básico", valor: 7800, status: "confirmado", porcentaje: 10.0, base: 78000, nivel: "Nivel 1", comision: 7800 },
    { id: "20", voucher: "VCH-2026-020", fecha: "2026-02-10", plan: "Plan Premium", valor: 12500, status: "confirmado", porcentaje: 12.5, base: 100000, nivel: "Nivel 1", comision: 12500 },
    
    // Enero 2026
    { id: "21", voucher: "VCH-2026-021", fecha: "2026-01-25", plan: "Plan Enterprise", valor: 35000, status: "confirmado", porcentaje: 17.5, base: 200000, nivel: "Nivel 3", comision: 35000 },
    { id: "22", voucher: "VCH-2026-022", fecha: "2026-01-20", plan: "Plan Premium", valor: 15800, status: "confirmado", porcentaje: 13.0, base: 121538, nivel: "Nivel 1", comision: 15800 },
  ],
  invoices: [
    {
      id: "INV-001",
      fecha: "2026-03-01",
      vouchers: ["VCH-2026-031", "VCH-2026-032"],
      totalComision: 28500,
      totalLiquidado: 25650,
      xmlFileName: "factura-001.xml",
      pdfFileName: "factura-001.pdf",
      status: "aprobada"
    },
    {
      id: "INV-002",
      fecha: "2026-02-28",
      vouchers: ["VCH-2026-033", "VCH-2026-034", "VCH-2026-035"],
      totalComision: 42300,
      totalLiquidado: 38070,
      xmlFileName: "factura-002.xml",
      pdfFileName: "factura-002.pdf",
      status: "aprobada"
    },
    {
      id: "INV-003",
      fecha: "2026-02-15",
      vouchers: ["VCH-2026-036"],
      totalComision: 15000,
      totalLiquidado: 13500,
      xmlFileName: "factura-003.xml",
      pdfFileName: "factura-003.pdf",
      status: "aprobada"
    },
    {
      id: "INV-004",
      fecha: "2026-01-30",
      vouchers: ["VCH-2026-037", "VCH-2026-038"],
      totalComision: 33200,
      totalLiquidado: 29880,
      xmlFileName: "factura-004.xml",
      pdfFileName: "factura-004.pdf",
      status: "aprobada"
    },
    {
      id: "INV-005",
      fecha: "2026-01-15",
      vouchers: ["VCH-2026-039", "VCH-2026-040", "VCH-2026-041"],
      totalComision: 51800,
      totalLiquidado: 46620,
      xmlFileName: "factura-005.xml",
      pdfFileName: "factura-005.pdf",
      status: "aprobada"
    },
  ],
  availableOperationsCount: 7,
  
  updateOperationStatus: (voucher, status) => {
    set((state) => ({
      operations: state.operations.map((op) =>
        op.voucher === voucher ? { ...op, status } : op
      ),
      availableOperationsCount: state.operations.filter(op => 
        op.voucher === voucher ? status === "disponible" : op.status === "disponible"
      ).length,
    }));
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