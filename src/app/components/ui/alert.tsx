import { ReactNode } from "react";
import { Info, AlertTriangle, AlertCircle, CheckCircle2, LucideIcon } from "lucide-react";
import { alertBg, alertIcon, alertText } from "../../utils/ui";

export type AlertVariant = "success" | "warning" | "danger" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Componente de Alerta alineado a la Guía de Uso del Sistema de Color:
 * fondo suave + borde perimetral 1px + ícono representativo.
 */
export function Alert({ variant, title, children, className = "" }: AlertProps) {
  const Icon: LucideIcon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
  }[variant];

  return (
    <div className={`rounded-lg p-4 ${alertBg[variant]} ${className}`} role={variant === "danger" ? "alert" : "status"}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alertIcon[variant]}`} />
        <div className="flex-1">
          {title && <p className={`text-sm font-medium ${alertText[variant]}`}>{title}</p>}
          {children && <div className={`text-sm ${alertText[variant]} ${title ? "mt-1" : ""}`}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
