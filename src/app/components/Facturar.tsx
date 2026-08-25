import { useState, useMemo } from "react";
import { FileText, Upload, CheckCircle2, FileCheck, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "../store/appStore";
import { useNavigate } from "react-router";
import { ConfirmInvoiceModal } from "./ConfirmInvoiceModal";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";
import { fireSuccessConfetti } from "../utils/confetti";
import {
  BTN_CTA,
  BTN_PRIMARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
} from "../utils/ui";

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
  const [errors] = useState<{ xml?: string; pdf?: string }>({});

  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  const availableOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesStatus = op.status === "disponible";

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
        rfc: "GARM850312AB1",
        razonSocial: "María García López",
      };

      addInvoice(invoice);
      setIsLoading(false);
      setSubmitted(true);
      fireSuccessConfetti();

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
        <div className="w-20 h-20 bg-success-soft rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-azul-oscuro">¡Factura enviada exitosamente!</h2>
          <p className={TEXT_SECONDARY}>
            Tu factura ha sido registrada y se procesará en las próximas 24-48 horas.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/historial")}
            className={`px-6 py-3 border ${BORDER_DEFAULT} ${TEXT_SECONDARY} rounded-lg hover:bg-canvas transition-colors font-medium`}
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
            className={`${BTN_PRIMARY} px-6 py-3 rounded-lg font-medium`}
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
        <div className="w-20 h-20 bg-canvas rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-text-secondary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-azul-oscuro">No hay operaciones disponibles</h2>
          <p className={TEXT_SECONDARY}>
            Confirma pagos en la sección de Cartera para poder facturar
          </p>
        </div>
        <button
          onClick={() => navigate("/cartera")}
          className={`${BTN_CTA} px-6 py-3 rounded-lg font-medium`}
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
          <h2 className="text-azul-oscuro mb-2">Facturar Comisiones</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Selecciona las operaciones confirmadas y sube tu factura
          </p>
        </div>

        <DateFilter />
      </div>

      {/* Selection Table */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas border-b border-border-base">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOperations.size === availableOperations.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Seleccionar todas las operaciones"
                    className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Voucher
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Porcentaje de comisión
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Base MXN
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Valor comisión
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {availableOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className={`transition-colors ${
                    selectedOperations.has(operation.id) ? "bg-celeste-soft" : "hover:bg-canvas"
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOperations.has(operation.id)}
                      onChange={() => handleSelectOperation(operation.id)}
                      aria-label={`Seleccionar ${operation.voucher}`}
                      className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-azul-oscuro">{operation.voucher}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm ${TEXT_SECONDARY}`}>{operation.porcentaje}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm ${TEXT_SECONDARY}`}>
                      ${operation.base.toLocaleString("es-MX")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-info-soft text-info-border`}>
                      {operation.nivel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-azul-oscuro">
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
        <div className="bg-azul-oscuro rounded-xl shadow-lg p-6 text-white">
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
              <p className="text-2xl font-bold text-celeste">
                ${totalComision.toLocaleString("es-MX")} MXN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
        <h3 className="text-azul-oscuro mb-4">Subir Factura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploadBox
            label="Archivo XML"
            accept=".xml"
            file={xmlFile}
            onFileChange={setXmlFile}
            icon="xml"
          />

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
      <div className="flex flex-col items-end gap-3">
        {isLoading && (
          <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4 w-full max-w-md`}>
            <p className="text-sm font-semibold text-azul-oscuro mb-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-celeste" />
              Enviando tu factura...
            </p>
            <ol className="space-y-2 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-success text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                Validando archivos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-success text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                Cifrando información
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center text-[10px] animate-pulse">3</span>
                Transmitiendo al SAT
              </li>
            </ol>
          </div>
        )}
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={selectedOperations.size === 0 || !xmlFile || !pdfFile || isLoading}
          className={`${BTN_CTA} px-8 py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-3`}
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
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validExtensions = icon === "xml" ? [".xml"] : [".pdf"];
    const hasValidExt = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError(`El archivo debe ser ${icon.toUpperCase()} válido`);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("El archivo no debe superar los 10 MB");
      return;
    }

    setError(null);
    onFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    const inputEl = document.getElementById(`${icon}-upload`) as HTMLInputElement;
    if (inputEl) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(droppedFile);
      inputEl.files = dataTransfer.files;
      inputEl.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const removeFile = () => {
    setError(null);
    onFileChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-azul-oscuro mb-2">
        {label}
        <span className="text-danger ml-1">*</span>
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
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
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            error
              ? "border-danger bg-danger-soft"
              : "border-border-base bg-canvas hover:border-celeste hover:bg-canvas"
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 p-4 relative w-full">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
                aria-label={`Eliminar archivo ${label}`}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-canvas border border-border-base"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
              <FileCheck className="w-10 h-10 text-success" />
              <span className="text-sm font-medium text-azul-oscuro text-center px-8 break-all">
                {file.name}
              </span>
              <span className={`text-xs ${TEXT_SECONDARY}`}>{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className={`w-10 h-10 ${error ? "text-danger" : "text-text-secondary"}`} />
              <span className="text-sm text-azul-oscuro">
                Arrastra o haz clic para subir {icon.toUpperCase()}
              </span>
              <span className={`text-xs ${TEXT_SECONDARY}`}>Máximo 10 MB</span>
            </div>
          )}
        </label>
      </div>
      {error && (
        <p role="alert" className="text-danger text-sm mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
