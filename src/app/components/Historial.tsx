import { useState, useMemo } from "react";
import { FileText, Download, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";

export function Historial() {
  const invoices = useAppStore((state) => state.invoices);
  const [filter, setFilter] = useState<"all" | "procesando" | "aprobada" | "rechazada">("all");
  const { period, customStartDate, customEndDate } = useDateFilterStore();

  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  // Filter by date and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = filter === "all" || inv.status === filter;
      
      // Date filter
      const invDate = new Date(inv.fecha);
      const matchesDate = invDate >= dateRange.startDate && invDate <= dateRange.endDate;
      
      return matchesStatus && matchesDate;
    });
  }, [invoices, filter, dateRange]);

  // Mostrar solo facturas reales del store
  const displayInvoices = filteredInvoices;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[#00184C] mb-2">Historial de Facturas</h2>
        <p className="text-sm text-gray-600">Consulta todas tus facturas enviadas</p>
      </div>

      {/* Filters Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Status Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43D3FF] focus:border-[#43D3FF] hover:border-[#43D3FF] transition-colors text-sm font-medium text-[#00184C]"
        >
          <option value="all">Todos los estados</option>
          <option value="procesando">En proceso</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>

        {/* Date Filter */}
        <DateFilter />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Facturado"
          value={`$${displayInvoices.reduce((sum, inv) => sum + inv.totalComision, 0).toLocaleString("es-MX")} MXN`}
          icon={<FileText className="w-5 h-5" />}
          color="bg-[#00184C] text-white"
        />
        <StatCard
          label="Facturas Aprobadas"
          value={displayInvoices.filter((inv) => inv.status === "aprobada").length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="bg-green-50 text-green-700 border border-green-200"
        />
        <StatCard
          label="En Proceso"
          value={displayInvoices.filter((inv) => inv.status === "procesando").length}
          icon={<Clock className="w-5 h-5" />}
          color="bg-orange-50 text-orange-700 border border-orange-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {displayInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay facturas registradas</p>
            <p className="text-sm text-gray-400">Las facturas que envíes aparecerán aquí</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    ID Factura
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Vouchers
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Total Liquidado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Total Comisión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#00184C] uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#00184C]">{invoice.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{invoice.fecha}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {invoice.vouchers.slice(0, 2).map((v) => (
                          <span
                            key={v}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {v}
                          </span>
                        ))}
                        {invoice.vouchers.length > 2 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{invoice.vouchers.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-gray-600">
                        ${invoice.totalLiquidado.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-[#00184C]">
                        ${invoice.totalComision.toLocaleString("es-MX")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`${color} rounded-xl shadow-sm p-5`}>
      <div className="flex items-center gap-3">
        <div>{icon}</div>
        <div>
          <p className="text-sm opacity-80 mb-0.5">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "procesando" | "aprobada" | "rechazada" }) {
  const config = {
    procesando: {
      label: "En proceso",
      icon: Clock,
      className: "bg-orange-100 text-orange-700 border-orange-200",
    },
    aprobada: {
      label: "Aprobada",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-700 border-green-200",
    },
    rechazada: {
      label: "Rechazada",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-200",
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