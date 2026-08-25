import { X, AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";
import {
  BTN_CTA,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  alertBg,
  alertText,
} from "../utils/ui";

interface ConfirmInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedOps: any[];
  totalComision: number;
  totalLiquidado: number;
  xmlFile: File | null;
  pdfFile: File | null;
  isLoading: boolean;
}

export function ConfirmInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  selectedOps,
  totalComision,
  totalLiquidado,
  xmlFile,
  pdfFile,
  isLoading,
}: ConfirmInvoiceModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${BORDER_DEFAULT}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-soft rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="text-azul-oscuro">Confirmar envío de factura</h3>
              <p className={`text-sm ${TEXT_SECONDARY} mt-1`}>Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-canvas rounded-lg transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className={`w-5 h-5 ${TEXT_SECONDARY}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Warning message (alerta oficial: fondo suave + borde + ícono) */}
          <div className={`${alertBg.warning} rounded-lg p-4`}>
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-medium ${alertText.warning}`}>Antes de confirmar, verifica:</p>
                <ul className={`text-sm ${alertText.warning} mt-2 space-y-1 list-disc list-inside`}>
                  <li>Los archivos XML y PDF son correctos</li>
                  <li>Las operaciones seleccionadas son las correctas</li>
                  <li>Los montos coinciden con tu factura</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-azul-oscuro">Resumen de la factura</h4>

            <div className={`${BG_CANVAS} rounded-lg p-4 space-y-3`}>
              <div className="flex justify-between text-sm">
                <span className={TEXT_SECONDARY}>Operaciones incluidas:</span>
                <span className="font-semibold text-azul-oscuro">{selectedOps.length}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className={TEXT_SECONDARY}>Total liquidado:</span>
                <span className="font-semibold text-azul-oscuro">
                  ${totalLiquidado.toLocaleString("es-MX")} MXN
                </span>
              </div>

              <div className={`flex justify-between text-sm pt-3 border-t ${BORDER_DEFAULT}`}>
                <span className={TEXT_SECONDARY}>Total comisión:</span>
                <span className="font-bold text-success text-lg">
                  ${totalComision.toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className={`w-4 h-4 ${TEXT_SECONDARY}`} />
                <span className={TEXT_SECONDARY}>XML:</span>
                <span className="font-medium text-azul-oscuro">{xmlFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className={`w-4 h-4 ${TEXT_SECONDARY}`} />
                <span className={TEXT_SECONDARY}>PDF:</span>
                <span className="font-medium text-azul-oscuro">{pdfFile?.name}</span>
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className={`${alertBg.info} rounded-lg p-3`}>
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <p className={`text-xs ${alertText.info}`}>
                Una vez enviada, la factura será procesada en las próximas 24-48 horas.
                Podrás ver el estado en la sección de Historial.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${BTN_SECONDARY} flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50`}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${BTN_CTA} flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar y enviar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
