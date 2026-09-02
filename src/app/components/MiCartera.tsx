import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle2, Clock, Hourglass, Receipt, Info, ChevronDown, X } from "lucide-react";
import { ConfirmPaymentModal } from "./ConfirmPaymentModal";
import { useAppStore, Operation } from "../store/appStore";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";
import { fireSuccessConfetti } from "../utils/confetti";
import { EmptyState } from "./EmptyState";
import {
  BTN_CTA,
  BTN_PRIMARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  PENDIENTE_CLASS,
  PENDIENTE_RECAUDO_CLASS,
  CONFIRMADO_CLASS,
  DISPONIBLE_CLASS,
  opStatusClass,
} from "../utils/ui";

type Status = "pendiente" | "pendiente-recaudo" | "disponible" | "confirmado";
type SortKey = "voucher" | "fecha" | "plan" | "valor";
type SortConfig = { key: SortKey; direction: "asc" | "desc" } | null;

const VALID_STATUSES: Status[] = ["pendiente", "pendiente-recaudo", "confirmado", "disponible"];

export function MiCartera() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const operations = useAppStore((state) => state.operations);
  const updateOperationStatus = useAppStore((state) => state.updateOperationStatus);
  const { period, customStartDate, customEndDate } = useDateFilterStore();

  // Estado inicial desde query params (deep-link desde Resumen u otros)
  const initialStatus = (() => {
    const s = searchParams.get("status");
    if (s && VALID_STATUSES.includes(s as Status)) return s as Status;
    return "all" as Status;
  })();
  const initialVoucher = searchParams.get("voucher") ?? "";

  const [searchTerm, setSearchTerm] = useState(initialVoucher);
  const [statusFilter, setStatusFilter] = useState<Status | "all">(initialStatus);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Limpiar query params al montar (el deep-link ?voucher= ya no abre detalle)
  useEffect(() => {
    if (searchParams.get("voucher") || searchParams.get("status")) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar filtros a query params cuando cambian
  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (searchTerm) params.voucher = searchTerm;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !showModal) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, searchTerm]);

  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesSearch = op.voucher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || op.status === statusFilter;

      const opDate = new Date(op.fecha);
      const matchesDate = opDate >= dateRange.startDate && opDate <= dateRange.endDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [operations, searchTerm, statusFilter, dateRange]);

  const sortedOperations = useMemo(() => {
    if (!sortConfig) return filteredOperations;
    const { key, direction } = sortConfig;
    return [...filteredOperations].sort((a, b) => {
      let aValue: string | number = a[key] as string | number;
      let bValue: string | number = b[key] as string | number;
      if (key === "fecha") {
        aValue = new Date(a.fecha).getTime();
        bValue = new Date(b.fecha).getTime();
      }
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredOperations, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleConfirmPayment = async (voucher: string, banco: string, referencia: string, file: File | null) => {
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    updateOperationStatus(voucher, "confirmado");
    setShowModal(false);
    setSelectedOperation(null);
    setSelectedVouchers(prev => {
      const next = new Set(prev);
      next.delete(voucher);
      return next;
    });
    setIsLoading(false);

    fireSuccessConfetti();

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

  const handleFacturar = (operation: Operation) => {
    // Acceso directo al wizard con la operación preseleccionada
    navigate(`/facturar?voucher=${operation.voucher}`);
  };

  const pendingVouchers = filteredOperations.filter(op => op.status === "pendiente");
  const allPendingSelected =
    pendingVouchers.length > 0 &&
    pendingVouchers.every(op => selectedVouchers.has(op.voucher));

  const toggleSelectAll = () => {
    if (allPendingSelected) {
      setSelectedVouchers(new Set());
    } else {
      setSelectedVouchers(new Set(pendingVouchers.map(op => op.voucher)));
    }
  };

  const toggleVoucher = (voucher: string) => {
    setSelectedVouchers(prev => {
      const next = new Set(prev);
      if (next.has(voucher)) next.delete(voucher);
      else next.add(voucher);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className={`text-sm ${TEXT_SECONDARY}`}>Gestiona y confirma tus comisiones pendientes</p>
        </div>

        <DateFilter />
      </div>

      {/* Filters & Search */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar por voucher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste transition-colors"
              ref={searchInputRef}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-secondary" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="px-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste transition-colors bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente de confirmación</option>
              <option value="pendiente-recaudo">Pendiente de recaudo</option>
              <option value="confirmado">Pago confirmado</option>
              <option value="disponible">Disponible para facturar</option>
            </select>
          </div>
        </div>

        {/* Chips de filtros activos (deep-link visual) */}
        {(statusFilter !== "all" || searchTerm) && (
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border-base">
            <span className={`text-xs ${TEXT_SECONDARY}`}>Filtros activos:</span>
            {statusFilter !== "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 text-xs bg-warning-soft text-warning border border-warning-border/30 px-2 py-1 rounded-full hover:bg-warning/10 transition-colors"
              >
                Estado: {statusFilter}
                <X className="w-3 h-3" />
              </button>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-1 text-xs bg-celeste-soft text-celeste border border-celeste-subtle px-2 py-1 rounded-full hover:bg-celeste/20 transition-colors"
              >
                Búsqueda: "{searchTerm}"
                <X className="w-3 h-3" />
              </button>
            )}
            {(statusFilter !== "all" || searchTerm) && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="text-xs text-azul-oscuro hover:text-celeste underline ml-auto"
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Guide (acordeón) */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        <button
          onClick={() => setShowStatusGuide(!showStatusGuide)}
          className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
            showStatusGuide ? BG_CANVAS : `hover:bg-canvas`
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-celeste rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-azul-oscuro">Guía de Estados</h3>
              <p className={`text-xs ${TEXT_SECONDARY}`}>Comprende el significado de cada estado de comisión</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-azul-oscuro transition-transform ${showStatusGuide ? 'rotate-180' : ''}`} />
        </button>

        {showStatusGuide && (
          <div className="px-6 pb-6 pt-2 bg-canvas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pendiente de confirmación — Warning (acción requerida) */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-warning shadow-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${PENDIENTE_CLASS}`}>
                      Pendiente de confirmación
                    </span>
                    <p className={`text-xs ${TEXT_SECONDARY} leading-relaxed mt-2`}>
                      <span className="font-semibold text-warning-border">Acción requerida:</span> La comisión ha sido generada pero aún no has confirmado el pago. Debes subir el comprobante bancario para continuar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pendiente de recaudo — Neutro (proceso en curso) */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-azul-oscuro shadow-sm">
                <div className="flex items-start gap-3">
                  <Hourglass className="w-5 h-5 text-azul-oscuro mt-0.5" />
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${PENDIENTE_RECAUDO_CLASS}`}>
                      Pendiente de recaudo
                    </span>
                    <p className={`text-xs ${TEXT_SECONDARY} leading-relaxed mt-2`}>
                      <span className="font-semibold text-azul-oscuro">En proceso:</span> El pago está en curso de ser recaudado. La empresa está procesando la operación financiera.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pago confirmado — Info */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-info shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-info mt-0.5" />
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CONFIRMADO_CLASS}`}>
                      Pago confirmado
                    </span>
                    <p className={`text-xs ${TEXT_SECONDARY} leading-relaxed mt-2`}>
                      <span className="font-semibold text-info-border">Completado:</span> El pago ha sido confirmado y procesado exitosamente por la empresa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disponible para facturar — Success */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-success shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${DISPONIBLE_CLASS}`}>
                      Disponible para facturar
                    </span>
                    <p className={`text-xs ${TEXT_SECONDARY} leading-relaxed mt-2`}>
                      <span className="font-semibold text-success-border">Listo:</span> La comisión está lista para que generes y envíes tu factura. Ve a la sección "Facturar" para continuar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        {selectedVouchers.size > 0 && (
          <div
            role="region"
            aria-label="Acciones para selección masiva"
            className="flex items-center justify-between gap-4 px-6 py-3 bg-celeste-soft border-b border-celeste-subtle"
          >
            <div className="text-sm text-azul-oscuro">
              <span className="font-semibold">{selectedVouchers.size}</span> voucher{selectedVouchers.size > 1 ? "es" : ""} pendiente{selectedVouchers.size > 1 ? "s" : ""} seleccionado{selectedVouchers.size > 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedVouchers(new Set())}
                className="px-3 py-1.5 text-sm text-azul-oscuro hover:bg-white/50 rounded-lg transition-colors"
              >
                Limpiar selección
              </button>
              <button
                onClick={() => {
                  const firstPending = pendingVouchers.find(op =>
                    selectedVouchers.has(op.voucher)
                  );
                  if (firstPending) {
                    setSelectedOperation(firstPending);
                    setShowModal(true);
                  }
                }}
                className={`${BTN_CTA} px-4 py-1.5 rounded-lg text-sm font-semibold`}
              >
                Confirmar pago{selectedVouchers.size > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`bg-canvas border-b border-border-base`}>
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los vouchers pendientes"
                    checked={allPendingSelected}
                    onChange={toggleSelectAll}
                    disabled={pendingVouchers.length === 0}
                    className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste disabled:opacity-40"
                  />
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("voucher")}
                    className="flex items-center gap-2 text-xs font-semibold text-azul-oscuro uppercase tracking-wider hover:text-celeste transition-colors"
                  >
                    Voucher
                    <SortIcon column="voucher" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("fecha")}
                    className="flex items-center gap-2 text-xs font-semibold text-azul-oscuro uppercase tracking-wider hover:text-celeste transition-colors"
                  >
                    Fecha de emisión
                    <SortIcon column="fecha" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("plan")}
                    className="flex items-center gap-2 text-xs font-semibold text-azul-oscuro uppercase tracking-wider hover:text-celeste transition-colors"
                  >
                    Plan
                    <SortIcon column="plan" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleSort("valor")}
                    className="flex items-center gap-2 text-xs font-semibold text-azul-oscuro uppercase tracking-wider hover:text-celeste transition-colors ml-auto"
                  >
                    Valor por cobrar
                    <SortIcon column="valor" sortConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    Estado
                    <button
                      onClick={() => setShowStatusGuide(!showStatusGuide)}
                      className="group relative"
                      title="Ver guía de estados"
                    >
                      <Info className="w-4 h-4 text-text-secondary hover:text-celeste transition-colors cursor-pointer" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {sortedOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className={`hover:bg-canvas transition-colors ${selectedVouchers.has(operation.voucher) ? "bg-celeste-soft" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar voucher ${operation.voucher}`}
                      checked={selectedVouchers.has(operation.voucher)}
                      onChange={() => toggleVoucher(operation.voucher)}
                      disabled={operation.status !== "pendiente"}
                      className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste disabled:opacity-30"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-azul-oscuro">{operation.voucher}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${TEXT_SECONDARY}`}>{operation.fecha}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${TEXT_SECONDARY}`}>{operation.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-azul-oscuro">
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
                          className={`${BTN_CTA} px-4 py-2 rounded-lg text-sm font-medium`}
                        >
                          Confirmar pago
                        </button>
                      )}
                      {operation.status === "disponible" && (
                        <button
                          onClick={() => handleFacturar(operation)}
                          aria-label={`Facturar ${operation.voucher}`}
                          className={`${BTN_CTA} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}
                        >
                          <Receipt className="w-4 h-4" />
                          Facturar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {sortedOperations.length === 0 && (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No hay operaciones que coincidan con los filtros actuales. Ajusta la búsqueda, el estado o el rango de fechas."
          primaryAction={{
            label: "Limpiar filtros",
            onClick: () => { setSearchTerm(""); setStatusFilter("all"); },
          }}
        />
      )}

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
    </div>
  );
}

function SortIcon({ column, sortConfig }: { column: SortKey; sortConfig: SortConfig }) {
  if (sortConfig?.key === column) {
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 text-celeste" />
    ) : (
      <ArrowDown className="w-3 h-3 text-celeste" />
    );
  }
  return <ArrowUpDown className="w-3 h-3 opacity-40" />;
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    pendiente: { label: "Pendiente de confirmación", icon: Clock },
    "pendiente-recaudo": { label: "Pendiente de recaudo", icon: Hourglass },
    confirmado: { label: "Pago confirmado", icon: CheckCircle2 },
    disponible: { label: "Disponible para facturar", icon: CheckCircle2 },
  };

  const { label, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${opStatusClass[status]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
