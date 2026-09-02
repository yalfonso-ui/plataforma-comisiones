// ============================================================
// Domain Types — Plataforma de Gestión de Comisiones
// ============================================================

// País
export type Pais = "CO" | "MX";

// Tipo de cliente
export type TipoCliente = "juridica" | "natural";

// Estado de factura — cadena completa de aprobación
export type InvoiceStatus =
  | "en_cartera"           // Factura enviada, esperando aprobación de Cartera
  | "aprobada_cartera"     // Cartera aprobó → pasa a Comisiones
  | "en_comisiones"        // Esperando aprobación de Comisiones
  | "aprobada_comisiones"  // Comisiones aprobó → lista para dispersar
  | "dispersada"           // Pago dispersado al comercial
  | "rechazada_cartera"    // Rechazada por Cartera
  | "rechazada_comisiones" // Rechazada por Comisiones
  | "rechazada";           // Rechazo genérico (compatibilidad)

// Snapshot fiscal — cálculo colombiano
export interface FiscalSnapshot {
  tipoCliente: TipoCliente;
  aplicarISR: boolean;
  baseGravable: number;        // suma de op.base de las operaciones seleccionadas
  comisionBruta: number;       // suma de op.comision
  iva: number;                 // comisionBruta * 0.19
  retefuente: number;          // comisionBruta * tasaRetefuente
  reteica: number;             // comisionBruta * tasaReteICA (si aplica)
  isr: number;                 // (comisionBruta - retefuente) * 0.10 si aplicarISR
  totalImpuestos: number;      // iva - retefuente - reteica + isr
  totalComision: number;       // comisionBruta - totalImpuestos (neto al comercial)
  totalBase: number;           // suma base de operaciones
}

// Archivo real guardado en base64
export interface FileAttachment {
  name: string;
  size: number;
  base64: string;
  uuid?: string;     // extraído del XML (CFDI/DIAN)
  folio?: string;    // extraído del XML
}

// Agencia
export interface Agencia {
  id: string;
  nombre: string;
  pais: Pais;
  codigoEVA: string;
  contactoEmail: string;
  activa: boolean;
}
