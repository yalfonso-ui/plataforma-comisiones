import { X, FileText, Calendar, Percent, Building2, DollarSign, Hash, User, CheckCircle2, Clock, Hourglass } from "lucide-react";
import {
  BTN_PRIMARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  alertBg,
  alertText,
  opStatusClass,
} from "../utils/ui";

interface Operation {
  id: string;
  voucher: string;
  fecha: string;
  plan: string;
  valor: number;
  status: "pendiente" | "pendiente-recaudo" | "confirmado" | "disponible";
  porcentaje?: number;
  base?: number;
  nivel?: string;
  comision?: number;
}

interface OperationDetailModalProps {
  operation: Operation | null;
  onClose: () => void;
  onMarkDisponible?: (voucher: string) => void;
}

export function OperationDetailModal({ operation, onClose, onMarkDisponible }: OperationDetailModalProps) {
  if (!operation) return null;

  const statusIcons = {
    pendiente: Clock,
    "pendiente-recaudo": Hourglass,
    confirmado: CheckCircle2,
    disponible: CheckCircle2,
  };
  const StatusIcon = statusIcons[operation.status];

  const statusLabels = {
    pendiente: "Pendiente de confirmación",
    "pendiente-recaudo": "Pendiente de recaudo",
    confirmado: "Pago confirmado",
    disponible: "Disponible para facturar",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${BORDER_DEFAULT}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-celeste-soft rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-azul-oscuro" />
            </div>
            <div>
              <h3 className="text-azul-oscuro font-semibold">Detalle de Operación</h3>
              <p className={`text-sm ${TEXT_SECONDARY}`}>{operation.voucher}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-canvas rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className={`w-5 h-5 ${TEXT_SECONDARY}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${opStatusClass[operation.status]}`}>
              <StatusIcon className="w-4 h-4" />
              {statusLabels[operation.status]}
            </span>
          </div>

          {/* Operation Details */}
          <div className={`${BG_CANVAS} rounded-xl p-5 space-y-4`}>
            <h4 className="text-sm font-semibold text-azul-oscuro uppercase tracking-wide">Información de la operación</h4>

            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Fecha de emisión" value={operation.fecha} />
            <DetailRow icon={<Building2 className="w-4 h-4" />} label="Plan" value={operation.plan} />

            {operation.nivel && (
              <DetailRow icon={<User className="w-4 h-4" />} label="Nivel" value={operation.nivel} />
            )}
          </div>

          {/* Financial Details */}
          <div className={`${BG_CANVAS} rounded-xl p-5 space-y-4`}>
            <h4 className="text-sm font-semibold text-azul-oscuro uppercase tracking-wide">Detalles financieros</h4>

            <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Valor por cobrar" value={`$${operation.valor.toLocaleString("es-MX")} MXN`} highlight />

            {operation.porcentaje && (
              <DetailRow icon={<Percent className="w-4 h-4" />} label="Porcentaje de comisión" value={`${operation.porcentaje}%`} />
            )}

            {operation.base && (
              <DetailRow icon={<Hash className="w-4 h-4" />} label="Base liquidable" value={`$${operation.base.toLocaleString("es-MX")} MXN`} />
            )}

            {operation.comision && (
              <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Comisión" value={`$${operation.comision.toLocaleString("es-MX")} MXN`} highlight highlightColor="text-success-border" />
            )}
          </div>

          {/* Alerta Success: confirmação */}
          {operation.status === "confirmado" && onMarkDisponible && (
            <div className={`${alertBg.success} rounded-xl p-4`}>
              <p className={`text-sm text-success-border mb-3`}>
                El pago ha sido confirmado. Si ya se ha procesado el recaudo, puedes marcarlo como disponible para facturar.
              </p>
              <button
                onClick={() => {
                  onMarkDisponible(operation.voucher);
                  onClose();
                }}
                className="w-full px-4 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como disponible para facturar
              </button>
            </div>
          )}

          {/* Alerta Warning: pendiente */}
          {operation.status === "pendiente" && (
            <div className={`${alertBg.warning} rounded-xl p-4`}>
              <p className={`text-sm ${alertText.warning}`}>
                Esta operación espera confirmación de pago. Dirígete a la sección de Cartera para confirmar el pago y continuar con el proceso de facturación.
              </p>
            </div>
          )}

          {/* Alerta Info: pendiente-recaudo */}
          {operation.status === "pendiente-recaudo" && (
            <div className={`${alertBg.info} rounded-xl p-4`}>
              <p className={`text-sm ${alertText.info}`}>
                El pago está en proceso de recaudo por parte de la empresa. Recibirás una notificación cuando se confirme el cobro.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${BORDER_DEFAULT}`}>
          <button
            onClick={onClose}
            className={`${BTN_PRIMARY} w-full px-6 py-3 rounded-lg font-medium`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, highlight, highlightColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 ${TEXT_SECONDARY}`}>
        <span className="text-celeste">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? `text-xl font-bold ${highlightColor ?? "text-azul-oscuro"}` : "text-azul-oscuro"}`}>
        {value}
      </span>
    </div>
  );
}
