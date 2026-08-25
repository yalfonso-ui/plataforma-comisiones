import { X, AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-[#00184C]">Confirmar envío de factura</h3>
              <p className="text-sm text-gray-600 mt-1">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Warning message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Antes de confirmar, verifica:</p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Los archivos XML y PDF son correctos</li>
                  <li>Las operaciones seleccionadas son las correctas</li>
                  <li>Los montos coinciden con tu factura</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#00184C]">Resumen de la factura</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Operaciones incluidas:</span>
                <span className="font-semibold text-[#00184C]">{selectedOps.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total liquidado:</span>
                <span className="font-semibold text-[#00184C]">
                  ${totalLiquidado.toLocaleString("es-MX")} MXN
                </span>
              </div>
              
              <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                <span className="text-gray-600">Total comisión:</span>
                <span className="font-bold text-[#F9D35A] text-lg">
                  ${totalComision.toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">XML:</span>
                <span className="font-medium text-[#00184C]">{xmlFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">PDF:</span>
                <span className="font-medium text-[#00184C]">{pdfFile?.name}</span>
              </div>
            </div>
          </div>

          {/* Important note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
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
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg hover:bg-[#F9D35A]/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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