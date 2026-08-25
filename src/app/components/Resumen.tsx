import { TrendingUp, Clock, CheckCircle2, DollarSign, Calendar, Printer, ArrowUpRight } from "lucide-react";
import { useAppStore, Operation } from "../store/appStore";
import { Link, useNavigate } from "react-router";
import { useMemo } from "react";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";
import { toast } from "sonner";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";
import { AnimatedCounter } from "./AnimatedCounter";

export function Resumen() {
  const operations = useAppStore((state) => state.operations);
  const invoices = useAppStore((state) => state.invoices);
  const updateOperationStatus = useAppStore((state) => state.updateOperationStatus);
  const { period, customStartDate, customEndDate } = useDateFilterStore();
  const navigate = useNavigate();

  const dateRange = useMemo(() => {
    return getDateRange(period, customStartDate, customEndDate);
  }, [period, customStartDate, customEndDate]);

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
  const disponibles = filteredOperations.filter((op) => op.status === "disponible");

  const totalPendiente = pendientes.reduce((sum, op) => sum + op.valor, 0);
  const totalDisponible = disponibles.reduce((sum, op) => sum + (op.comision || op.valor), 0);
  const totalFacturado = filteredInvoices.reduce((sum, inv) => sum + inv.totalComision, 0);
  const totalGeneral = totalPendiente + totalDisponible + totalFacturado;

  const actividadReciente = useMemo<Operation[]>(() => {
    return [...filteredOperations]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [filteredOperations]);

  // Deep-linking: cada KPI navega con query params
  const goToCarteraPending = () => {
    navigate("/cartera?status=pendiente");
  };
  const goToFacturar = () => {
    navigate("/facturar");
  };
  const goToHistorial = () => {
    navigate("/historial");
  };

  const handleOpenOperation = (op: Operation) => {
    updateOperationStatus(op.voucher, op.status); // no-op para asegurar reactividad
    navigate(`/cartera?voucher=${encodeURIComponent(op.voucher)}`);
  };

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendientes.length, disponibles.length, filteredInvoices.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-azul-oscuro mb-2">Resumen General</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Vista general de tus comisiones y actividad
            <span className="inline-flex items-center gap-1 ml-2 text-[11px] opacity-70">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Actualizado a las {lastUpdated}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.print();
              toast.success("Imprimiendo resumen...");
            }}
            className={`px-3 py-2 border ${BORDER_DEFAULT} rounded-lg hover:bg-white hover:border-celeste transition-colors text-sm font-medium text-azul-oscuro inline-flex items-center gap-2 bg-white print:hidden`}
            aria-label="Imprimir resumen"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>

          <DateFilter />
        </div>
      </div>

      {/* KPIs (clickeables) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Comisiones"
          value={`$${totalGeneral.toLocaleString("es-MX")}`}
          subtitle="MXN acumulado"
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-azul-oscuro"
          textColor="text-white"
          ariaLabel="Total acumulado sin acción"
        />

        <KPICard
          title="Pendientes"
          value={`$${totalPendiente.toLocaleString("es-MX")}`}
          subtitle={`${pendientes.length} operaciones por confirmar`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-warning-soft border border-warning-border/30"
          textColor="text-warning-border"
          badge={pendientes.length}
          badgeColor="bg-warning"
          onClick={goToCarteraPending}
          ariaLabel={`Ir a Cartera filtrando por ${pendientes.length} operaciones pendientes`}
        />

        <KPICard
          title="Disponible para Facturar"
          value={`$${totalDisponible.toLocaleString("es-MX")}`}
          subtitle={`${disponibles.length} operaciones`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="bg-success-soft border border-success-border/30"
          textColor="text-success-border"
          badge={disponibles.length}
          badgeColor="bg-success"
          onClick={goToFacturar}
          ariaLabel={`Ir a Facturar con ${disponibles.length} operaciones disponibles`}
        />

        <KPICard
          title="Facturado"
          value={`$${totalFacturado.toLocaleString("es-MX")}`}
          subtitle={`${filteredInvoices.length} facturas enviadas`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-info-soft border border-info-border/30"
          textColor="text-info-border"
          onClick={goToHistorial}
          ariaLabel="Ir a Historial de facturas"
        />
      </div>

      {/* Quick Actions */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
        <h3 className="text-azul-oscuro mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/cartera?status=pendiente"
            className={`flex items-center gap-4 p-4 border ${BORDER_DEFAULT} rounded-lg hover:border-warning hover:bg-warning-soft transition-all group`}
          >
            <div className="w-12 h-12 bg-warning-soft rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-azul-oscuro">Revisar Pendientes</p>
              <p className={`text-sm ${TEXT_SECONDARY}`}>
                {pendientes.length} por confirmar
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-azul-oscuro transition-colors" />
          </Link>

          <Link
            to="/facturar"
            className={`flex items-center gap-4 p-4 border ${BORDER_DEFAULT} rounded-lg hover:border-success hover:bg-success-soft transition-all group`}
          >
            <div className="w-12 h-12 bg-success-soft rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-azul-oscuro">Crear Factura</p>
              <p className={`text-sm ${TEXT_SECONDARY}`}>{disponibles.length} disponibles</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-azul-oscuro transition-colors" />
          </Link>

          <Link
            to="/historial"
            className={`flex items-center gap-4 p-4 border ${BORDER_DEFAULT} rounded-lg hover:border-info hover:bg-info-soft transition-all group`}
          >
            <div className="w-12 h-12 bg-info-soft rounded-lg flex items-center justify-center group-hover:bg-info/20 transition-colors">
              <Calendar className="w-6 h-6 text-info" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-azul-oscuro">Ver Historial</p>
              <p className={`text-sm ${TEXT_SECONDARY}`}>{filteredInvoices.length} facturas enviadas</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-text-secondary group-hover:text-azul-oscuro transition-colors" />
          </Link>
        </div>
      </div>

      {/* Actividad reciente (clickeable) */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-azul-oscuro">Actividad Reciente</h3>
          <Link
            to="/cartera"
            className={`text-xs ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors inline-flex items-center gap-1`}
          >
            Ver todas
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {actividadReciente.length === 0 ? (
          <div className="text-center py-10">
            <div className={`w-12 h-12 mx-auto ${BG_CANVAS} rounded-full flex items-center justify-center mb-3`}>
              <Clock className={`w-5 h-5 ${TEXT_SECONDARY}`} />
            </div>
            <p className={`text-sm ${TEXT_SECONDARY}`}>No hay actividad reciente en este periodo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actividadReciente.map((op) => (
              <button
                key={op.id}
                onClick={() => handleOpenOperation(op)}
                className={`w-full flex items-center justify-between p-4 ${BG_CANVAS} rounded-lg hover:bg-celeste-soft hover:border-celeste border border-transparent transition-all text-left group`}
                aria-label={`Abrir operación ${op.voucher} (${op.plan})`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    op.status === "pendiente" ? "bg-warning" :
                    op.status === "pendiente-recaudo" ? "bg-azul-oscuro" :
                    op.status === "confirmado" ? "bg-info" :
                    "bg-success"
                  }`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-medium text-azul-oscuro truncate">{op.voucher}</p>
                    <p className={`text-sm ${TEXT_SECONDARY} truncate`}>{op.plan}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-semibold text-azul-oscuro">
                    ${op.valor.toLocaleString("es-MX")} MXN
                  </p>
                  <p className={`text-xs ${TEXT_SECONDARY}`}>{op.fecha}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 ml-2 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
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
  onClick?: () => void;
  ariaLabel?: string;
}

function KPICard({ title, value, subtitle, icon, color, textColor, badge, badgeColor, onClick, ariaLabel }: KPICardProps) {
  const interactive = !!onClick;

  const inner = (
    <>
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
        <p className={`text-2xl font-bold ${textColor} mb-1`}>
          <AnimatedCounter value={value} />
        </p>
        <p className={`text-xs ${textColor} opacity-75`}>{subtitle}</p>
        {interactive && (
          <span className={`inline-flex items-center gap-1 mt-3 text-xs font-medium ${textColor} opacity-90 group-hover:opacity-100 transition-opacity`}>
            Ver detalle
            <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>
      {interactive && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <ArrowUpRight className={`w-4 h-4 ${textColor}`} />
        </div>
      )}
    </>
  );

  const baseClass = `${color} rounded-xl shadow-sm p-6 relative overflow-hidden ${
    interactive ? "group hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer" : ""
  }`;

  if (interactive) {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${baseClass} text-left w-full`}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      {inner}
    </div>
  );
}
