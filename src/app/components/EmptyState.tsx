import { Link } from "react-router";
import { Inbox, RotateCcw } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, BG_CANVAS, BORDER_DEFAULT, TEXT_SECONDARY } from "../utils/ui";

interface EmptyStateProps {
  icon?: typeof Inbox;
  title: string;
  description: string;
  primaryAction?: { label: string; to?: string; onClick?: () => void };
  secondaryAction?: { label: string; to?: string; onClick?: () => void };
}

/**
 * Empty State reutilizable: ícono + título + descripción + 0..2 acciones.
 * Usado en Cartera (cuando no hay resultados) e Historial (cuando no hay facturas).
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-12 text-center`}
    >
      <div className={`w-20 h-20 mx-auto ${BG_CANVAS} rounded-full flex items-center justify-center mb-4`}>
        <Icon className="w-10 h-10 text-text-secondary" />
      </div>
      <p className="text-azul-oscuro mb-2 font-semibold">{title}</p>
      <p className={`text-sm ${TEXT_SECONDARY} mb-6 max-w-md mx-auto`}>
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction?.to && (
            <Link
              to={primaryAction.to}
              className={`${BTN_PRIMARY} px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2`}
            >
              <RotateCcw className="w-4 h-4" />
              {primaryAction.label}
            </Link>
          )}
          {primaryAction?.onClick && !primaryAction.to && (
            <button
              onClick={primaryAction.onClick}
              className={`${BTN_PRIMARY} px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2`}
            >
              <RotateCcw className="w-4 h-4" />
              {primaryAction.label}
            </button>
          )}
          {secondaryAction?.to && (
            <Link
              to={secondaryAction.to}
              className={`${BTN_SECONDARY} px-5 py-2.5 rounded-lg font-medium`}
            >
              {secondaryAction.label}
            </Link>
          )}
          {secondaryAction?.onClick && !secondaryAction.to && (
            <button
              onClick={secondaryAction.onClick}
              className={`${BTN_SECONDARY} px-5 py-2.5 rounded-lg font-medium`}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
