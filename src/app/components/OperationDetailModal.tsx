import { X, FileText, Calendar, Percent, Building2, DollarSign, Hash, User, CheckCircle2, Clock, Hourglass } from "lucide-react";

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

  const statusConfig = {
    pendiente: { label: "Pendiente de confirmación", icon: Clock, color: "orange", bg: "bg-orange-100", text: "text-orange-700" },
    "pendiente-recaudo": { label: "Pendiente de recaudo", icon: Hourglass, color: "yellow", bg: "bg-yellow-100", text: "text-yellow-700" },
    confirmado: { label: "Pago confirmado", icon: CheckCircle2, color: "blue", bg: "bg-blue-100", text: "text-blue-700" },
    disponible: { label: "Disponible para facturar", icon: CheckCircle2, color: "green", bg: "bg-green-100", text: "text-green-700" },
  };

  const status = statusConfig[operation.status];
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#43D3FF]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#00184C]" />
            </div>
            <div>
              <h3 className="text-[#00184C] font-semibold">Detalle de Operación</h3>
              <p className="text-sm text-gray-500">{operation.voucher}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
          </div>

          {/* Operation Details */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-[#00184C] uppercase tracking-wide">Información de la operación</h4>

            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Fecha de emisión" value={operation.fecha} />
            <DetailRow icon={<Building2 className="w-4 h-4" />} label="Plan" value={operation.plan} />

            {operation.nivel && (
              <DetailRow icon={<User className="w-4 h-4" />} label="Nivel" value={operation.nivel} />
            )}
          </div>

          {/* Financial Details */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-semibold text-[#00184C] uppercase tracking-wide">Detalles financieros</h4>

            <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Valor por cobrar" value={`$${operation.valor.toLocaleString("es-MX")} MXN`} highlight />

            {operation.porcentaje && (
              <DetailRow icon={<Percent className="w-4 h-4" />} label="Porcentaje de comisión" value={`${operation.porcentaje}%`} />
            )}

            {operation.base && (
              <DetailRow icon={<Hash className="w-4 h-4" />} label="Base liquidable" value={`$${operation.base.toLocaleString("es-MX")} MXN`} />
            )}

            {operation.comision && (
              <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Comisión" value={`$${operation.comision.toLocaleString("es-MX")} MXN`} highlight highlightColor="text-[#F9D35A]" />
            )}
          </div>

          {/* Action for confirmado status */}
          {operation.status === "confirmado" && onMarkDisponible && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800 mb-3">
                El pago ha sido confirmado. Si ya se ha procesado el recaudo, puedes marcarlo como disponible para facturar.
              </p>
              <button
                onClick={() => {
                  onMarkDisponible(operation.voucher);
                  onClose();
                }}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar como disponible para facturar
              </button>
            </div>
          )}

          {/* Pending status message */}
          {operation.status === "pendiente" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm text-orange-800">
                Esta operación espera confirmación de pago. Dirígete a la sección de Cartera para confirmar el pago y continuar con el proceso de facturación.
              </p>
            </div>
          )}

          {/* Pendiente-recaudo status message */}
          {operation.status === "pendiente-recaudo" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                El pago está en proceso de recaudo por parte de la empresa. Recibirás una notificación cuando se confirme el cobro.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#00184C] text-white rounded-lg hover:bg-[#00184C]/90 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, highlight, highlightColor }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean; highlightColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-[#43D3FF]">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? "text-xl font-bold " + (highlightColor || "text-[#00184C]") : "text-[#00184C]"}`}>
        {value}
      </span>
    </div>
  );
}
