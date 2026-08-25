import { useState, useMemo, useEffect, useRef } from "react";
import { FileText, Upload, CheckCircle2, FileCheck, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "../store/appStore";
import { useNavigate } from "react-router";
import { ConfirmInvoiceModal } from "./ConfirmInvoiceModal";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";

export function Facturar() {
  const navigate = useNavigate();
  const operations = useAppStore((state) => state.operations);
  const addInvoice = useAppStore((state) => state.addInvoice);
  const { period, customStartDate, customEndDate } = useDateFilterStore();
  
  const [selectedOperations, setSelectedOperations] = useState<Set<string>>(new Set());
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<{ xml?: string; pdf?: string }>({});

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  // Filter available operations by date and status
  const availableOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesStatus = op.status === "disponible";
      
      // Date filter
      const opDate = new Date(op.fecha);
      const matchesDate = opDate >= dateRange.startDate && opDate <= dateRange.endDate;
      
      return matchesStatus && matchesDate;
    });
  }, [operations, dateRange]);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${dateRange.startDate.toLocaleDateString('es-MX', options)} - ${dateRange.endDate.toLocaleDateString('es-MX', options)}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOperations(new Set(availableOperations.map((op) => op.id)));
    } else {
      setSelectedOperations(new Set());
    }
  };

  const handleSelectOperation = (id: string) => {
    const newSelected = new Set(selectedOperations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOperations(newSelected);
  };

  const selectedOps = availableOperations.filter((op) => selectedOperations.has(op.id));
  const totalLiquidado = selectedOps.reduce((sum, op) => sum + op.base, 0);
  const totalComision = selectedOps.reduce((sum, op) => sum + op.comision, 0);

  const handleSubmit = () => {
    if (selectedOperations.size === 0) {
      toast.error("Selecciona al menos una operación");
      return;
    }
    if (!xmlFile || !pdfFile) {
      toast.error("Debes subir ambos archivos (XML y PDF)");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const invoice = {
        id: `INV-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        vouchers: selectedOps.map(op => op.voucher),
        totalComision: totalComision,
        totalLiquidado: totalLiquidado,
        xmlFileName: xmlFile!.name,
        pdfFileName: pdfFile!.name,
        status: "procesando" as const,
      };
      
      addInvoice(invoice);
      setIsLoading(false);
      setSubmitted(true);
      
      toast.success("Factura enviada correctamente", {
        description: "Se procesará en las próximas 24-48 horas",
        action: {
          label: "Ver Historial",
          onClick: () => navigate("/historial"),
        },
      });
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-[#00184C]">¡Factura enviada exitosamente!</h2>
          <p className="text-gray-600">
            Tu factura ha sido registrada y se procesará en las próximas 24-48 horas.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/historial")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Ver Historial
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedOperations(new Set());
              setXmlFile(null);
              setPdfFile(null);
            }}
            className="px-6 py-3 bg-[#00184C] text-white rounded-lg hover:bg-[#00184C]/90 transition-colors font-medium"
          >
            Nueva factura
          </button>
        </div>
      </div>
    );
  }

  if (availableOperations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-[#00184C]">No hay operaciones disponibles</h2>
          <p className="text-gray-600">
            Confirma pagos en la sección de Cartera para poder facturar
          </p>
        </div>
        <button
          onClick={() => navigate("/cartera")}
          className="px-6 py-3 bg-[#F9D35A] text-[#00184C] rounded-lg hover:bg-[#F9D35A]/90 transition-colors font-medium"
        >
          Ir a Cartera
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[#00184C] mb-2">Facturar Comisiones</h2>
          <p className="text-sm text-gray-600">
            Selecciona las operaciones confirmadas y sube tu factura
          </p>
        </div>

        {/* Period Filter */}
        <DateFilter />
      </div>

      {/* Selection Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOperations.size === availableOperations.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-[#43D3FF] rounded border-gray-300 focus:ring-[#43D3FF] accent-[#43D3FF]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Voucher
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Porcentaje de comisión
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Base MXN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Valor comisión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {availableOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className={`transition-colors ${
                    selectedOperations.has(operation.id) ? "bg-[#43D3FF]/5" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOperations.has(operation.id)}
                      onChange={() => handleSelectOperation(operation.id)}
                      className="w-4 h-4 text-[#43D3FF] rounded border-gray-300 focus:ring-[#43D3FF] accent-[#43D3FF]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#00184C]">{operation.voucher}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600">{operation.porcentaje}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600">
                      ${operation.base.toLocaleString("es-MX")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {operation.nivel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#00184C]">
                      ${operation.comision.toLocaleString("es-MX")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      {selectedOperations.size > 0 && (
        <div className="bg-gradient-to-br from-[#00184C] to-[#002a6e] rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 text-white">Resumen Financiero</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-white/70 mb-1">Operaciones seleccionadas</p>
              <p className="text-2xl font-bold">{selectedOperations.size}</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Total liquidado</p>
              <p className="text-2xl font-bold">${totalLiquidado.toLocaleString("es-MX")} MXN</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Total comisión</p>
              <p className="text-2xl font-bold text-[#F9D35A]">
                ${totalComision.toLocaleString("es-MX")} MXN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-[#00184C] mb-4">Subir Factura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* XML Upload */}
          <FileUploadBox
            label="Archivo XML"
            accept=".xml"
            file={xmlFile}
            onFileChange={setXmlFile}
            icon="xml"
          />

          {/* PDF Upload */}
          <FileUploadBox
            label="Archivo PDF"
            accept=".pdf"
            file={pdfFile}
            onFileChange={setPdfFile}
            icon="pdf"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={selectedOperations.size === 0 || !xmlFile || !pdfFile || isLoading}
          className="px-8 py-4 bg-[#F9D35A] text-[#00184C] rounded-lg hover:bg-[#F9D35A]/90 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando factura...
            </>
          ) : (
            "Enviar factura"
          )}
        </button>
      </div>

      {/* Confirm Invoice Modal */}
      <ConfirmInvoiceModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onSubmit={handleSubmit}
        selectedOps={selectedOps}
        totalLiquidado={totalLiquidado}
        totalComision={totalComision}
        xmlFile={xmlFile}
        pdfFile={pdfFile}
        isLoading={isLoading}
      />
    </div>
  );
}

interface FileUploadBoxProps {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  icon: "xml" | "pdf";
}

function FileUploadBox({ label, accept, file, onFileChange, icon }: FileUploadBoxProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    onFileChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#00184C] mb-2">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`${icon}-upload`}
        />
        <label
          htmlFor={`${icon}-upload`}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#43D3FF] transition-colors bg-gray-50 hover:bg-gray-100"
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 p-4 relative w-full">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <FileCheck className="w-10 h-10 text-green-600" />
              <span className="text-sm font-medium text-[#00184C] text-center px-8">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-gray-400" />
              <span className="text-sm text-gray-600">
                Arrastra o haz clic para subir {icon.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">Máximo 10 MB</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}