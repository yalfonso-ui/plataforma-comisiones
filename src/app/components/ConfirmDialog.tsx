import { ReactNode } from "react";
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2, LucideIcon } from "lucide-react";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
  BTN_CTA,
  BORDER_DEFAULT,
  TEXT_SECONDARY,
} from "../utils/ui";

export type ConfirmVariant = "primary" | "danger" | "warning" | "cta";
export type ConfirmIntent = "info" | "danger" | "warning" | "success";

interface ConfirmAction {
  label: string;
  onClick: () => void;
  /** Si se omite, el botón se muestra deshabilitado. */
  loading?: boolean;
  /** Por defecto: "primary" */
  variant?: "primary" | "danger" | "cta";
  /** Si se omite, se enfoca este botón al abrir. */
  autoFocus?: boolean;
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  intent?: ConfirmIntent;
  cancelLabel?: string;
  cancelVariant?: "secondary" | "ghost";
  confirmAction: ConfirmAction;
  children?: ReactNode;
}

const intentIcon: Record<ConfirmIntent, LucideIcon> = {
  info: Info,
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
};

const intentClasses: Record<ConfirmIntent, string> = {
  info: "bg-info-soft text-info border border-info-border/30",
  danger: "bg-danger-soft text-danger border border-danger-border/30",
  warning: "bg-warning-soft text-warning border border-warning-border/30",
  success: "bg-success-soft text-success border border-success-border/30",
};

function actionClass(variant: "primary" | "danger" | "cta" | undefined) {
  if (variant === "danger") return BTN_DANGER;
  if (variant === "cta") return BTN_CTA;
  return BTN_PRIMARY;
}

/**
 * Diálogo de confirmación reutilizable.
 *
 * Construido según la Guía:
 * - Header con ícono según `intent`
 * - Cuerpo con título + descripción + contenido opcional
 * - Acciones: cancelar (secondary) + confirmar (variant por defecto)
 *
 * Accesibilidad:
 * - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` en el título
 * - Escape para cerrar (montado por el consumidor o aquí)
 * - Focus trap básico (botón primario autofocus)
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  intent = "info",
  cancelLabel = "Cancelar",
  cancelVariant = "secondary",
  confirmAction,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  const Icon = intentIcon[intent];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className={`bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 ${BORDER_DEFAULT} border`}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${intentClasses[intent]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-azul-oscuro">
              {title}
            </h3>
            {description && (
              <p className={`text-sm ${TEXT_SECONDARY} mt-1`}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar diálogo"
            className={`p-1 rounded-lg hover:bg-canvas ${TEXT_SECONDARY}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children && <div className="mb-6">{children}</div>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={
              cancelVariant === "ghost"
                ? `px-4 py-2 ${TEXT_SECONDARY} hover:text-azul-oscuro rounded-lg text-sm font-medium transition-colors`
                : `${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium`
            }
          >
            {cancelLabel}
          </button>
          <button
            onClick={confirmAction.onClick}
            disabled={confirmAction.loading}
            autoFocus={confirmAction.autoFocus !== false}
            className={`${actionClass(confirmAction.variant)} px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmAction.loading ? "Procesando..." : confirmAction.label}
          </button>
        </div>
      </div>
    </div>
  );
}
