import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, ArrowUpDown, CheckCircle2, Clock, FileText, Eye, Info, AlertCircle, Hourglass, X, RotateCcw, ChevronDown } from "lucide-react";
import { ConfirmPaymentModal } from "./ConfirmPaymentModal";
import { OperationDetailModal } from "./OperationDetailModal";
import { useAppStore, Operation } from "../store/appStore";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";

type Status = "pendiente" | "pendiente-recaudo" | "disponible" | "confirmado";

export function Cartera() {
  const navigate = useNavigate();
  const operations = useAppStore((state) => state.operations);
  const updateOperationStatus = useAppStore((state) => state.updateOperationStatus);
  const { period, customStartDate, customEndDate } = useDateFilterStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === "/" && !showModal) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // ESC to close modal or clear search
      if (e.key === "Escape") {
        if (showModal) {
          setShowModal(false);
          setSelectedOperation(null);
        } else if (searchTerm) {
          setSearchTerm("");
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, searchTerm]);

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesSearch = op.voucher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || op.status === statusFilter;
      
      // Date filter
      const opDate = new Date(op.fecha);
      const matchesDate = opDate >= dateRange.startDate && opDate <= dateRange.endDate;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [operations, searchTerm, statusFilter, dateRange]);

  const handleConfirmPayment = async (voucher: string, banco: string, referencia: string, file: File | null) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateOperationStatus(voucher, "confirmado");
    setShowModal(false);
    setSelectedOperation(null);
    setIsLoading(false);

    toast.success("Pago confirmado exitosamente", {
      description: `El voucher ${voucher} ha sido confirmado. Una vez disponible, podrás facturarlo.`,
      action: {
        label: "Ir a Facturar",
        onClick: () => navigate("/facturar"),
      },
    });
  };

  const handleMarkDisponible = (voucher: string) => {
    updateOperationStatus(voucher, "disponible");
    toast.success("Operación disponible para facturar", {
      description: `El voucher ${voucher} ahora está listo para incluir en una factura`,
      action: {
        label: "Ir a Facturar",
        onClick: () => navigate("/facturar"),
      },
    });
  };

  const handleViewDetail = (operation: Operation) => {
    setSelectedOperation(operation);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[#00184C] mb-2">Cartera de Comisiones</h2>
          <p className="text-sm text-gray-600">Gestiona y confirma tus comisiones pendientes</p>
        </div>

        {/* Date Filter */}
        <DateFilter />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por voucher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-transparent"
              ref={searchInputRef}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente de confirmación</option>
              <option value="pendiente-recaudo">Pendiente de recaudo</option>
              <option value="confirmado">Pago confirmado</option>
              <option value="disponible">Disponible para facturar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Guide */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowStatusGuide(!showStatusGuide)}
          className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
            showStatusGuide ? 'bg-gray-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#43D3FF] rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-[#00184C]">Guía de Estados</h3>
              <p className="text-xs text-gray-600">Comprende el significado de cada estado de comisión</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#00184C] transition-transform ${showStatusGuide ? 'rotate-180' : ''}`} />
        </button>

        {showStatusGuide && (
          <div className="px-6 pb-6 pt-2 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pendiente de confirmación */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-100 text-orange-700 border-orange-200">
                        Pendiente de confirmación
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-orange-700">Acción requerida:</span> La comisión ha sido generada pero aún no has confirmado el pago. Debes subir el comprobante bancario para continuar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pendiente de recaudo */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Hourglass className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-200">
                        Pendiente de recaudo
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-yellow-700">En proceso:</span> El pago está en curso de ser recaudado. La empresa está procesando la operación financiera.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pago confirmado */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                        Pago confirmado
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-blue-700">Completado:</span> El pago ha sido confirmado y procesado exitosamente por la empresa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disponible para facturar */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">
                        Disponible para facturar
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-green-700">Listo:</span> La comisión está lista para que generes y envíes tu factura. Ve a la sección "Facturar" para continuar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    Icono
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00184C] uppercase tracking-wider cursor-pointer hover:text-[#43D3FF]">
                    Voucher
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00184C] uppercase tracking-wider cursor-pointer hover:text-[#43D3FF]">
                    Fecha de emisión
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Valor por cobrar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Estado
                    <button
                      onClick={() => setShowStatusGuide(!showStatusGuide)}
                      className="group relative"
                      title="Ver guía de estados"
                    >
                      <Info className="w-4 h-4 text-gray-400 hover:text-[#43D3FF] transition-colors cursor-pointer" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOperations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 bg-[#43D3FF]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#43D3FF]" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#00184C]">{operation.voucher}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{operation.fecha}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{operation.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#00184C]">
                      ${operation.valor.toLocaleString("es-MX")} MXN
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={operation.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {operation.status === "pendiente" && (
                        <button
                          onClick={() => {
                            setSelectedOperation(operation);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-[#F9D35A] text-[#00184C] rounded-lg hover:bg-[#F9D35A]/90 transition-colors text-sm font-medium"
                        >
                          Confirmar pago
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetail(operation)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOperation && (
        <ConfirmPaymentModal
          operation={selectedOperation}
          onClose={() => {
            setShowModal(false);
            setSelectedOperation(null);
          }}
          onConfirm={handleConfirmPayment}
          isLoading={isLoading}
        />
      )}

      {/* Operation Detail Modal */}
      {showDetailModal && selectedOperation && (
        <OperationDetailModal
          operation={selectedOperation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOperation(null);
          }}
          onMarkDisponible={handleMarkDisponible}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    pendiente: {
      label: "Pendiente de confirmación",
      icon: Clock,
      className: "bg-orange-100 text-orange-700 border-orange-200",
    },
    "pendiente-recaudo": {
      label: "Pendiente de recaudo",
      icon: Hourglass,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    confirmado: {
      label: "Pago confirmado",
      icon: CheckCircle2,
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    disponible: {
      label: "Disponible para facturar",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-700 border-green-200",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}