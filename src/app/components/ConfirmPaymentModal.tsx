import { useState } from "react";
import { X, Upload, FileCheck, Loader2 } from "lucide-react";
import {
  BTN_CTA,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
} from "../utils/ui";

interface Operation {
  id: string;
  voucher: string;
  fecha: string;
  plan: string;
  valor: number;
  status: string;
}

interface ConfirmPaymentModalProps {
  operation: Operation;
  onClose: () => void;
  onConfirm: (voucher: string, banco: string, referencia: string, file: File | null) => void;
  isLoading?: boolean;
}

export function ConfirmPaymentModal({ operation, onClose, onConfirm, isLoading = false }: ConfirmPaymentModalProps) {
  const [banco, setBanco] = useState("");
  const [referencia, setReferencia] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});
    const newErrors: { [key: string]: string } = {};

    if (!banco) {
      newErrors.banco = "Por favor selecciona un banco";
    }

    if (!referencia) {
      newErrors.referencia = "La referencia de pago es obligatoria";
    } else if (referencia.length < 6) {
      newErrors.referencia = "La referencia debe tener al menos 6 caracteres";
    }

    if (!file) {
      newErrors.file = "Debes subir el comprobante de pago en PDF";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(operation.voucher, banco, referencia, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.type !== "application/pdf") {
        setErrors({ ...errors, file: "El archivo debe ser un PDF válido" });
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setErrors({ ...errors, file: "El archivo no debe superar los 10 MB" });
        return;
      }

      const newErrors = { ...errors };
      delete newErrors.file;
      setErrors(newErrors);

      setFile(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${BORDER_DEFAULT}`}>
          <div>
            <h3 className="text-azul-oscuro">Confirmar Pago</h3>
            <p className={`text-sm ${TEXT_SECONDARY} mt-1`}>Voucher: {operation.voucher}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operation Details */}
          <div className={`${BG_CANVAS} rounded-lg p-4 space-y-2`}>
            <div className="flex justify-between text-sm">
              <span className={TEXT_SECONDARY}>Plan:</span>
              <span className="font-medium text-azul-oscuro">{operation.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={TEXT_SECONDARY}>Fecha de emisión:</span>
              <span className="font-medium text-azul-oscuro">{operation.fecha}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={TEXT_SECONDARY}>Valor por cobrar:</span>
              <span className="font-semibold text-azul-oscuro">
                ${operation.valor.toLocaleString("es-MX")} MXN
              </span>
            </div>
          </div>

          {/* Banco */}
          <div>
            <label htmlFor="banco" className="block text-sm font-medium text-azul-oscuro mb-2">
              Banco <span className="text-danger">*</span>
            </label>
            <select
              id="banco"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              required
              className={`w-full px-4 py-3 border ${BORDER_DEFAULT} rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste bg-white`}
            >
              <option value="">Seleccionar banco</option>
              <option value="BBVA Bancomer">BBVA Bancomer</option>
              <option value="Santander">Santander</option>
              <option value="Banamex">Banamex</option>
              <option value="Banorte">Banorte</option>
              <option value="HSBC">HSBC</option>
              <option value="Scotiabank">Scotiabank</option>
            </select>
            {errors.banco && <p className="text-danger text-sm mt-1">{errors.banco}</p>}
          </div>

          {/* Referencia */}
          <div>
            <label htmlFor="referencia" className="block text-sm font-medium text-azul-oscuro mb-2">
              Referencia de pago <span className="text-danger">*</span>
            </label>
            <input
              id="referencia"
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
              placeholder="Ingresa la referencia del pago"
              className={`w-full px-4 py-3 border ${BORDER_DEFAULT} rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste`}
            />
            {errors.referencia && <p className="text-danger text-sm mt-1">{errors.referencia}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-azul-oscuro mb-2">
              Soporte PDF <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${errors.file ? "border-danger bg-danger-soft" : "border-border-base bg-canvas hover:border-celeste hover:bg-canvas"} rounded-lg cursor-pointer transition-colors`}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck className="w-8 h-8 text-success" />
                    <span className="text-sm font-medium text-azul-oscuro">{file.name}</span>
                    <span className={`text-xs ${TEXT_SECONDARY}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${errors.file ? "text-danger" : TEXT_SECONDARY}`} />
                    <span className="text-sm text-azul-oscuro">Arrastra o haz clic para subir PDF</span>
                    <span className={`text-xs ${TEXT_SECONDARY}`}>Máximo 10 MB</span>
                  </div>
                )}
              </label>
            </div>
            {errors.file && <p className="text-danger text-sm mt-1">{errors.file}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`${BTN_SECONDARY} flex-1 px-6 py-3 rounded-lg font-medium disabled:opacity-50`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${BTN_CTA} flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar pago"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
