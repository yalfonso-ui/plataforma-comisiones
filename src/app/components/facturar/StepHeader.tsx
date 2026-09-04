// ============================================================
// Cabecera compartida para los steps del wizard de facturación.
// Vive como HERMANO del grid (no dentro de la columna izquierda)
// para que el panel lateral de Resumen de Facturación quede
// alineado verticalmente con la tabla — y no contra el título.
// ============================================================

import type { ReactNode } from "react";
import { TEXT_SECONDARY } from "../../utils/ui";

interface StepHeaderProps {
  /** Título del step, ej: "Paso 1 — Selecciona las operaciones". */
  title: string;
  /** Descripción corta debajo del título. Opcional. */
  description?: ReactNode;
  /** Cuando es true, reduce el padding (usado por Paso 2 que es más compacto). */
  compact?: boolean;
}

export function StepHeader({ title, description, compact = false }: StepHeaderProps) {
  return (
    <div
      className={`bg-celeste-soft border border-celeste-subtle rounded-xl ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <h3
        className={`text-azul-oscuro font-semibold ${
          compact ? "text-sm mb-0.5" : "mb-1"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p className={`text-sm ${TEXT_SECONDARY}`}>{description}</p>
      )}
    </div>
  );
}
