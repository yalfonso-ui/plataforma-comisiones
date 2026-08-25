import { useState } from "react";
import { X, Upload, FileCheck, Loader2, AlertCircle } from "lucide-react";

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
    
    // Clear previous errors
    setErrors({});
    const newErrors: { [key: string]: string } = {};
    
    // Validate fields
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
    
    // If there are errors, show them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onConfirm(operation.voucher, banco, referencia, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        setErrors({ ...errors, file: "El archivo debe ser un PDF válido" });
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setErrors({ ...errors, file: "El archivo no debe superar los 10 MB" });
        return;
      }
      
      // Clear file error if validation passes
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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-[#00184C]">Confirmar Pago</h3>
            <p className="text-sm text-gray-600 mt-1">Voucher: {operation.voucher}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operation Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium text-[#00184C]">{operation.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fecha de emisión:</span>
              <span className="font-medium text-[#00184C]">{operation.fecha}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Valor por cobrar:</span>
              <span className="font-semibold text-[#00184C]">
                ${operation.valor.toLocaleString("es-MX")} MXN
              </span>
            </div>
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-[#00184C] mb-2">
              Banco
            </label>
            <select
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-transparent"
            >
              <option value="">Seleccionar banco</option>
              <option value="BBVA Bancomer">BBVA Bancomer</option>
              <option value="Santander">Santander</option>
              <option value="Banamex">Banamex</option>
              <option value="Banorte">Banorte</option>
              <option value="HSBC">HSBC</option>
              <option value="Scotiabank">Scotiabank</option>
            </select>
            {errors.banco && <p className="text-red-500 text-sm mt-1">{errors.banco}</p>}
          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-medium text-[#00184C] mb-2">
              Referencia de pago
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
              placeholder="Ingresa la referencia del pago"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-transparent"
            />
            {errors.referencia && <p className="text-red-500 text-sm mt-1">{errors.referencia}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-[#00184C] mb-2">
              Soporte PDF
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
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#43D3FF] transition-colors bg-gray-50 hover:bg-gray-100"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck className="w-8 h-8 text-green-600" />
                    <span className="text-sm font-medium text-[#00184C]">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Arrastra o haz clic para subir PDF</span>
                    <span className="text-xs text-gray-500">Máximo 10 MB</span>
                  </div>
                )}
              </label>
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg hover:bg-[#F9D35A]/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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