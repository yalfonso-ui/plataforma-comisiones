// ============================================================
// Motor Fiscal Colombiano
// IVA 19%, Retefuente configurable, ISR opcional
// ============================================================

import type { FiscalSnapshot, TipoCliente } from "../types/domain";

// Tasas por defecto (Colombia)
export const TASA_IVA_CO = 0.19;
export const TASA_RETEFUENTE_SERVICIOS = 0.04;
export const TASA_RETEFUENTE_HONORARIOS = 0.10;

/**
 * Calcula el snapshot fiscal completo para una factura.
 *
 * Regla del spec: "Al seleccionar ISR, el sistema aplica
 * IVA menos Retefuente" → totalImpuestos = IVA − Retefuente + ISR
 */
export function calcularFiscal(args: {
  comisionBruta: number;
  baseGravable: number;
  tipoCliente: TipoCliente;
  aplicarISR: boolean;
  tasaRetefuente?: number;
  tasaReteICA?: number;
}): FiscalSnapshot {
  const { comisionBruta, baseGravable, tipoCliente, aplicarISR } = args;

  // Por defecto: honorarios (10%) para natural, servicios (4%) para jurídica
  const tasaRet = args.tasaRetefuente ?? (tipoCliente === "natural" ? TASA_RETEFUENTE_HONORARIOS : TASA_RETEFUENTE_SERVICIOS);
  const tasaReteICA = args.tasaReteICA ?? 0;

  const iva = comisionBruta * TASA_IVA_CO;
  const retefuente = comisionBruta * tasaRet;
  const reteica = comisionBruta * tasaReteICA;
  const isr = aplicarISR ? (comisionBruta - retefuente) * 0.10 : 0;

  // Regla del spec: IVA − Retefuente (− ReteICA + ISR si aplica)
  const totalImpuestos = iva - retefuente - reteica + isr;
  const totalComision = comisionBruta - totalImpuestos;

  return {
    tipoCliente,
    aplicarISR,
    baseGravable,
    comisionBruta,
    iva,
    retefuente,
    reteica,
    isr,
    totalImpuestos,
    totalComision,
    totalBase: baseGravable,
  };
}

/** Formatea un monto como moneda COP */
export function formatCOP(amount: number): string {
  return `$${amount.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;
}

/** Formatea un porcentaje */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
