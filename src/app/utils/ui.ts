/**
 * Helpers de UI alineados a la Guía de Uso del Sistema de Color y Estilos UI.
 *
 * Construcción de badges por estado (texto + borde + fondo suave).
 * Construcción de alertas (fondo suave + borde perimetral).
 *
 * WCAG: textos sobre superficies claras o de acento usan --color-azul-oscuro
 * para asegurar el contraste de legibilidad.
 */

import type { Operation } from "../store/appStore";
import type { InvoiceStatus } from "../types/domain";

// ====================================================
// BADGES - Estados de la comisión
// ====================================================

/** Pendiente de confirmación = acción requerida del usuario (warning, no CTA). */
export const PENDIENTE_CLASS =
  "bg-warning-soft text-warning-border border-warning-border/30";

/** Pendiente de recaudo = proceso en curso, sin acción del usuario (neutro). */
export const PENDIENTE_RECAUDO_CLASS =
  "bg-azul-oscuro-soft text-azul-oscuro border-azul-oscuro/20";

/** Pago confirmado por la empresa = informativo (info). */
export const CONFIRMADO_CLASS =
  "bg-info-soft text-info-border border-info-border/30";

/** Disponible para facturar = éxito (success). */
export const DISPONIBLE_CLASS =
  "bg-success-soft text-success-border border-success-border/30";

export const opStatusClass: Record<Operation["status"], string> = {
  pendiente: PENDIENTE_CLASS,
  "pendiente-recaudo": PENDIENTE_RECAUDO_CLASS,
  confirmado: CONFIRMADO_CLASS,
  disponible: DISPONIBLE_CLASS,
};

// ====================================================
// BADGES - Estados de la factura (nuevos estados)
// ====================================================

export const invoiceStatusClass: Record<InvoiceStatus, string> = {
  en_cartera: PENDIENTE_RECAUDO_CLASS,           // pendiente de revisión
  aprobada_cartera: "bg-celeste-soft text-celeste border-celeste-subtle", // aprobada por cartera
  en_comisiones: "bg-warning-soft text-warning-border border-warning-border/30", // pendiente comisiones
  aprobada_comisiones: DISPONIBLE_CLASS,          // lista para dispersar
  dispersada: "bg-success-soft text-success-border border-success-border/30", // pagada
  rechazada: "bg-danger-soft text-danger-border border-danger-border/30",
  rechazada_cartera: "bg-danger-soft text-danger-border border-danger-border/30",
  rechazada_comisiones: "bg-danger-soft text-danger-border border-danger-border/30",
};

// Labels legibles para cada estado de factura
export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  en_cartera: "En Cartera",
  aprobada_cartera: "Aprobada por Cartera",
  en_comisiones: "En Comisiones",
  aprobada_comisiones: "Aprobada por Comisiones",
  dispersada: "Dispersada",
  rechazada: "Rechazada",
  rechazada_cartera: "Rechazada por Cartera",
  rechazada_comisiones: "Rechazada por Comisiones",
};

// ====================================================
// ALERTAS (fondo suave + borde 1px + icono)
// ====================================================

export const alertBg = {
  success: "bg-success-soft border border-success-border/30",
  warning: "bg-warning-soft border border-warning-border/30",
  danger: "bg-danger-soft border border-danger-border/30",
  info: "bg-info-soft border border-info-border/30",
} as const;

export const alertIcon = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
} as const;

export const alertText = {
  success: "text-success-border",
  warning: "text-warning-border",
  danger: "text-danger-border",
  info: "text-info-border",
} as const;

// ====================================================
// BOTONES
// ====================================================

/** Botón primario institucional (fondo azul oscuro). Hover definido por la guía. */
export const BTN_PRIMARY =
  "bg-azul-oscuro text-white hover:bg-azul-oscuro-hover transition-colors";

/** Botón CTA — amarillo. Reservado para conversión crítica. */
export const BTN_CTA =
  "bg-amarillo text-azul-oscuro hover:bg-amarillo-hover transition-colors";

/** Botón de peligro / eliminación. */
export const BTN_DANGER =
  "bg-danger text-white hover:bg-danger/90 transition-colors";

/** Botón secundario (outline). */
export const BTN_SECONDARY =
  "border border-border-base text-azul-oscuro hover:bg-canvas transition-colors";

// ====================================================
// HOVER STATES
// ====================================================

export const HOVER_BORDER_CELESTE = "hover:border-celeste";
export const HOVER_BG_CELESTE_SOFT = "hover:bg-celeste-soft";

// ====================================================
// TEXTOS Y BORDES NEUTRALES
// ====================================================

export const TEXT_SECONDARY = "text-text-secondary";
export const BORDER_DEFAULT = "border-border-base";
export const BG_CANVAS = "bg-canvas";
