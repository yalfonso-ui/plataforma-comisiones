import { TrendingUp, Clock, CheckCircle2, DollarSign, Calendar } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { Link } from "react-router";
import { useMemo } from "react";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";

export function Resumen() {
  const operations = useAppStore((state) => state.operations);
  const invoices = useAppStore((state) => state.invoices);
  const { period, customStartDate, customEndDate } = useDateFilterStore();
  
  // Calculate date range
  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

  // Filter operations and invoices by date range
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const opDate = new Date(op.fecha);
      return opDate >= dateRange.startDate && opDate <= dateRange.endDate;
    });
  }, [operations, dateRange]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = new Date(inv.fecha);
      return invDate >= dateRange.startDate && invDate <= dateRange.endDate;
    });
  }, [invoices, dateRange]);

  const pendientes = filteredOperations.filter((op) => op.status === "pendiente");
  const confirmados = filteredOperations.filter((op) => op.status === "confirmado");
  const disponibles = filteredOperations.filter((op) => op.status === "disponible");

  const totalPendiente = pendientes.reduce((sum, op) => sum + op.valor, 0);
  const totalDisponible = disponibles.reduce((sum, op) => sum + (op.comision || op.valor), 0);
  const totalFacturado = filteredInvoices.reduce((sum, inv) => sum + inv.totalComision, 0);
  const totalGeneral = totalPendiente + totalDisponible + totalFacturado;

  const actividadReciente = [...filteredOperations]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${dateRange.startDate.toLocaleDateString('es-MX', options)} - ${dateRange.endDate.toLocaleDateString('es-MX', options)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[#00184C] mb-2">Resumen General</h2>
          <p className="text-sm text-gray-600">Vista general de tus comisiones y actividad</p>
        </div>

        {/* Date Filter */}
        <DateFilter />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Comisiones"
          value={`$${totalGeneral.toLocaleString("es-MX")}`}
          subtitle="MXN acumulado"
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-gradient-to-br from-[#00184C] to-[#002a6e]"
          textColor="text-white"
        />
        
        <KPICard
          title="Pendientes"
          value={`$${totalPendiente.toLocaleString("es-MX")}`}
          subtitle={`${pendientes.length} operaciones`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-orange-50 border border-orange-200"
          textColor="text-orange-700"
          badge={pendientes.length}
          badgeColor="bg-orange-500"
        />
        
        <KPICard
          title="Disponible para Facturar"
          value={`$${totalDisponible.toLocaleString("es-MX")}`}
          subtitle={`${disponibles.length} operaciones`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="bg-green-50 border border-green-200"
          textColor="text-green-700"
          badge={disponibles.length}
          badgeColor="bg-green-500"
        />
        
        <KPICard
          title="Facturado"
          value={`$${totalFacturado.toLocaleString("es-MX")}`}
          subtitle={`${filteredInvoices.length} facturas`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-blue-50 border border-blue-200"
          textColor="text-blue-700"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-[#00184C] mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/cartera"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#43D3FF] hover:bg-[#43D3FF]/5 transition-all group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#00184C]">Revisar Pendientes</p>
              <p className="text-sm text-gray-600">{pendientes.length} por confirmar</p>
            </div>
          </Link>

          <Link
            to="/facturar"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#43D3FF] hover:bg-[#43D3FF]/5 transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#00184C]">Crear Factura</p>
              <p className="text-sm text-gray-600">{disponibles.length} disponibles</p>
            </div>
          </Link>

          <Link
            to="/historial"
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#43D3FF] hover:bg-[#43D3FF]/5 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#00184C]">Ver Historial</p>
              <p className="text-sm text-gray-600">{filteredInvoices.length} facturas enviadas</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-[#00184C] mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {actividadReciente.map((op) => (
            <div
              key={op.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  op.status === "pendiente" ? "bg-orange-500" :
                  op.status === "confirmado" ? "bg-blue-500" :
                  "bg-green-500"
                }`} />
                <div>
                  <p className="font-medium text-[#00184C]">{op.voucher}</p>
                  <p className="text-sm text-gray-600">{op.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#00184C]">
                  ${op.valor.toLocaleString("es-MX")} MXN
                </p>
                <p className="text-xs text-gray-500">{op.fecha}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  badge?: number;
  badgeColor?: string;
}

function KPICard({ title, value, subtitle, icon, color, textColor, badge, badgeColor }: KPICardProps) {
  return (
    <div className={`${color} rounded-xl shadow-sm p-6 relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={textColor}>{icon}</div>
          {badge !== undefined && badge > 0 && (
            <span className={`${badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
              {badge}
            </span>
          )}
        </div>
        <h4 className={`text-sm ${textColor} opacity-90 mb-1`}>{title}</h4>
        <p className={`text-2xl font-bold ${textColor} mb-1`}>{value}</p>
        <p className={`text-xs ${textColor} opacity-75`}>{subtitle}</p>
      </div>
    </div>
  );
}