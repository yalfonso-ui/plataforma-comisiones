// ============================================================
// Página de Cartera (rol) — Aprobación de facturas
// Vista EXCLUSIVA del rol "cartera" — aprueba facturas que el
// comercial radicó y las pasa a Comisiones.
// ============================================================

import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, X, FileCheck, Search, Building2, AlertTriangle, Receipt, Filter } from "lucide-react";
import { useAppStore, type Invoice } from "../../store/appStore";
import { toast } from "sonner";
import { usePermission } from "../../hooks/usePermission";
import {
  BTN_PRIMARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  alertBg,
  alertIcon,
  alertText,
  invoiceStatusClass,
  invoiceStatusLabel,
} from "../../utils/ui";
import type { InvoiceStatus } from "../../types/domain";

interface FacturaCartera extends Invoice {
  agenciaNombre?: string;
  agenciaCodigoEVA?: string;
}

export function CarteraPage() {
  const invoices = useAppStore((s) => s.invoices);
  const agencias = useAppStore((s) => s.agencias);
  const operations = useAppStore((s) => s.operations);
  const updateInvoiceStatus = useAppStore((s) => s.updateInvoiceStatus);
  const updateOperationStatus = useAppStore((s) => s.updateOperationStatus);
  const canApprove = usePermission("cartera:approve");
  const canReject = usePermission("cartera:reject");

  const [searchTerm, setSearchTerm] = useState("");
  const [rechazoModal, setRechazoModal] = useState<{ invoiceId: string; vouchers: string[] } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [expandedFiscal, setExpandedFiscal] = useState<Set<string>>(new Set());

  // ============================================================
  // Facturas que requieren acción de Cartera: en_cartera
  // ============================================================
  const facturasPendientes = useMemo(() => {
    const enriched: FacturaCartera[] = invoices
      .filter(inv => inv.status === "en_cartera")
      .map(inv => {
        const ag = agencias.find(a => a.id === inv.agenciaId);
        return {
          ...inv,
          agenciaNombre: ag?.nombre ?? "Sin agencia",
          agenciaCodigoEVA: ag?.codigoEVA ?? "—",
        };
      });

    if (!searchTerm) return enriched;
    const search = searchTerm.toLowerCase();
    return enriched.filter(inv =>
      inv.id.toLowerCase().includes(search) ||
      inv.vouchers.some(v => v.toLowerCase().includes(search)) ||
      (inv.agenciaNombre?.toLowerCase().includes(search) ?? false)
    );
  }, [invoices, agencias, searchTerm]);

  // ============================================================
  // KPIs
  // ============================================================
  const kpis = useMemo(() => {
    const todasCartera = invoices.filter(i =>
      ["en_cartera", "aprobada_cartera", "rechazada_cartera"].includes(i.status)
    );
    return {
      pendientes: todasCartera.filter(i => i.status === "en_cartera").length,
      aprobadas: todasCartera.filter(i => i.status === "aprobada_cartera").length,
      rechazadas: todasCartera.filter(i => i.status === "rechazada_cartera").length,
      montoPendiente: invoices
        .filter(i => i.status === "en_cartera")
        .reduce((s, i) => s + i.totalComision, 0),
    };
  }, [invoices]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleAprobar = (invoice: FacturaCartera) => {
    updateInvoiceStatus(invoice.id, "aprobada_cartera");
    toast.success("Factura aprobada", {
      description: `${invoice.id} pasó a Comisiones para revisión final.`,
    });
  };

  const handleRechazar = () => {
    if (!rechazoModal || !motivoRechazo.trim()) {
      toast.error("Indica el motivo del rechazo");
      return;
    }
    updateInvoiceStatus(rechazoModal.invoiceId, "rechazada_cartera", motivoRechazo);

    // Devolver las operaciones a status "disponible" para que el comercial
    // pueda corregir y volver a facturar
    rechazoModal.vouchers.forEach(voucher => {
      const op = operations.find(o => o.voucher === voucher);
      if (op && op.status === "confirmado") {
        updateOperationStatus(voucher, "disponible");
      }
    });

    toast.success("Factura rechazada y operaciones devueltas al comercial");
    setRechazoModal(null);
    setMotivoRechazo("");
  };

  const toggleFiscalExpand = (id: string) => {
    setExpandedFiscal(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const format = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      {/* Header con guía */}
      <div className={`bg-celeste-soft border border-celeste-subtle rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-4 h-4 text-azul-oscuro" />
          <h2 className="text-azul-oscuro font-semibold">Aprobaciones de Cartera</h2>
        </div>
        <p className={`text-sm ${TEXT_SECONDARY}`}>
          Revisa y aprueba las facturas radicadas por los comerciales. Al aprobar, la factura
          pasa a Comisiones para la dispersión final.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Pendientes" value={kpis.pendientes} color="bg-warning-soft text-warning border border-warning-border/30" />
        <KPI label="Aprobadas (mes)" value={kpis.aprobadas} color="bg-success-soft text-success border border-success-border/30" />
        <KPI label="Rechazadas (mes)" value={kpis.rechazadas} color="bg-danger-soft text-danger border border-danger-border/30" />
        <KPI label="Monto pendiente" value={`$${format(kpis.montoPendiente)}`} color="bg-azul-oscuro text-white" />
      </div>

      {/* Buscador */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar por ID, voucher o agencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
          />
        </div>
      </div>

      {/* Lista de facturas pendientes */}
      {facturasPendientes.length === 0 ? (
        <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-12 text-center`}>
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-azul-oscuro font-semibold mb-1">Sin facturas pendientes</p>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            No hay facturas en espera de aprobación. Las nuevas radicaciones aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {facturasPendientes.map(invoice => {
            const isExpanded = expandedFiscal.has(invoice.id);
            const hasFiscal = !!invoice.fiscal;
            return (
              <div key={invoice.id} className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
                {/* Header */}
                <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 bg-celeste-soft rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-azul-oscuro" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-azul-oscuro">{invoice.id}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${invoiceStatusClass[invoice.status as InvoiceStatus]}`}>
                        {invoiceStatusLabel[invoice.status as InvoiceStatus]}
                      </span>
                      {invoice.archivosValidados && (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <FileCheck className="w-3 h-3" />
                          Archivos validados
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
                      {invoice.agenciaNombre} ({invoice.agenciaCodigoEVA}) · {invoice.vouchers.length} voucher{invoice.vouchers.length !== 1 ? "s" : ""} · {invoice.fecha}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-azul-oscuro">${format(invoice.totalComision)}</p>
                    {hasFiscal && (
                      <button
                        onClick={() => toggleFiscalExpand(invoice.id)}
                        className="text-xs text-celeste hover:underline"
                      >
                        {isExpanded ? "Ocultar desglose" : "Ver desglose fiscal"}
                      </button>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {canApprove && (
                      <button
                        onClick={() => handleAprobar(invoice)}
                        className={`${BTN_PRIMARY} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-oscuro focus-visible:ring-offset-2`}
                        aria-label={`Aprobar factura ${invoice.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Aprobar
                      </button>
                    )}
                    {canReject && (
                      <button
                        onClick={() => setRechazoModal({ invoiceId: invoice.id, vouchers: invoice.vouchers })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger text-white hover:bg-danger/90 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
                        aria-label={`Rechazar factura ${invoice.id}`}
                      >
                        <X className="w-3 h-3" />
                        Rechazar
                      </button>
                    )}
                  </div>
                </div>

                {/* Desglose fiscal expandible */}
                {isExpanded && invoice.fiscal && (
                  <div className="px-5 py-4 bg-canvas border-t border-border-base">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-text-secondary uppercase tracking-wider">Base gravable</p>
                        <p className="font-semibold text-azul-oscuro">${format(invoice.fiscal.baseGravable)}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary uppercase tracking-wider">Comisión bruta</p>
                        <p className="font-semibold text-azul-oscuro">${format(invoice.fiscal.comisionBruta)}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary uppercase tracking-wider">IVA 19%</p>
                        <p className="font-semibold text-info">+ ${format(invoice.fiscal.iva)}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary uppercase tracking-wider">
                          Retefuente ({invoice.fiscal.tipoCliente === "juridica" ? "4%" : "10%"})
                        </p>
                        <p className="font-semibold text-success">− ${format(invoice.fiscal.retefuente)}</p>
                      </div>
                      {invoice.fiscal.aplicarISR && (
                        <div>
                          <p className="text-text-secondary uppercase tracking-wider">ISR 10%</p>
                          <p className="font-semibold text-warning">+ ${format(invoice.fiscal.isr)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-text-secondary uppercase tracking-wider">Total impuestos</p>
                        <p className={`font-semibold ${invoice.fiscal.totalImpuestos < 0 ? "text-success" : "text-danger"}`}>
                          {invoice.fiscal.totalImpuestos < 0 ? "−" : "+"} ${format(Math.abs(invoice.fiscal.totalImpuestos))}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-text-secondary uppercase tracking-wider">Total neto al comercial</p>
                        <p className="text-lg font-bold text-celeste">${format(invoice.fiscal.totalComision)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de rechazo */}
      {rechazoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="rechazo-titulo">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <h3 id="rechazo-titulo" className="text-azul-oscuro font-semibold">Rechazar factura {rechazoModal.invoiceId}</h3>
            </div>
            <p className={`text-sm ${TEXT_SECONDARY} mb-4`}>
              Indica el motivo del rechazo. Las operaciones (vouchers) volverán a estar
              <strong> disponibles para facturar </strong> y el comercial será notificado.
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Los archivos no coinciden con el voucher..."
              required
              aria-required="true"
              aria-invalid={motivoRechazo.trim().length === 0}
              rows={4}
              className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm resize-none"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setRechazoModal(null); setMotivoRechazo(""); }}
                className={`${BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-medium bg-white border border-border-base text-azul-oscuro hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
              >
                Rechazar factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`${color} rounded-xl shadow-sm p-4`}>
      <p className="text-xs opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
