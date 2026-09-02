// ============================================================
// Módulo Comisiones — Aprobación final y dispersión
// Facturas agrupadas por agencia con snapshot fiscal visible
// ============================================================

import { useMemo, useState, useEffect } from "react";
import { Download, CheckCircle2, X, FileCheck, ShieldCheck, Send, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { useAppStore, type Invoice } from "../../store/appStore";
import { toast } from "sonner";
import { usePermission } from "../../hooks/usePermission";
import {
  BTN_CTA,
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  alertBg,
  alertIcon,
  alertText,
  invoiceStatusClass,
  invoiceStatusLabel,
} from "../../utils/ui";
import type { InvoiceStatus } from "../../types/domain";
import { generarArchivoDispersion } from "../../utils/dispersion";

interface FacturaExpandida extends Invoice {
  agenciaNombre?: string;
  agenciaCodigoEVA?: string;
  agenciaPais?: string;
}

export function ComisionesPage() {
  const invoices = useAppStore((s) => s.invoices);
  const agencias = useAppStore((s) => s.agencias);
  const user = useAppStore((s) => s.user);
  const updateInvoiceStatus = useAppStore((s) => s.updateInvoiceStatus);
  const markInvoiceDispersed = useAppStore((s) => s.markInvoiceDispersed);
  const canApprove = usePermission("comisiones:approve");
  const canDispersar = usePermission("comisiones:dispersar");

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAgencias, setExpandedAgencias] = useState<Set<string>>(new Set());
  const [selectedForDispersion, setSelectedForDispersion] = useState<Set<string>>(new Set());
  const [rechazoModal, setRechazoModal] = useState<{ invoiceId: string } | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // ============================================================
  // Auto-expandir primera agencia al cargar
  // ============================================================
  useEffect(() => {
    if (agencias.length > 0 && expandedAgencias.size === 0) {
      setExpandedAgencias(new Set([agencias[0].id]));
    }
  }, [agencias, expandedAgencias.size]);

  // ============================================================
  // Agrupar facturas por agencia (solo aprobadas_cartera + en_comisiones)
  // ============================================================
  const facturasPorAgencia = useMemo(() => {
    const filtered = invoices.filter(inv =>
      ["aprobada_cartera", "en_comisiones", "aprobada_comisiones", "dispersada", "rechazada_comisiones"].includes(inv.status)
    );

    const enriched: FacturaExpandida[] = filtered.map(inv => {
      const ag = agencias.find(a => a.id === inv.agenciaId);
      return {
        ...inv,
        agenciaNombre: ag?.nombre ?? "Sin agencia",
        agenciaCodigoEVA: ag?.codigoEVA ?? "—",
        agenciaPais: ag?.pais ?? "—",
      };
    });

    const filteredBySearch = enriched.filter(inv => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return inv.id.toLowerCase().includes(search) ||
        inv.vouchers.some(v => v.toLowerCase().includes(search)) ||
        (inv.agenciaNombre?.toLowerCase().includes(search) ?? false);
    });

    // Agrupar
    const grouped: Record<string, FacturaExpandida[]> = {};
    filteredBySearch.forEach(inv => {
      const key = inv.agenciaId ?? "sin-agencia";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(inv);
    });

    return grouped;
  }, [invoices, agencias, searchTerm]);

  // ============================================================
  // KPIs
  // ============================================================
  const kpis = useMemo(() => {
    const allFacturas = Object.values(facturasPorAgencia).flat();
    return {
      total: allFacturas.length,
      pendientesAprobacion: allFacturas.filter(i => i.status === "aprobada_cartera").length,
      aprobadas: allFacturas.filter(i => i.status === "aprobada_comisiones").length,
      dispersadas: allFacturas.filter(i => i.status === "dispersada").length,
      montoTotal: allFacturas.reduce((s, i) => s + i.totalComision, 0),
    };
  }, [facturasPorAgencia]);

  // ============================================================
  // Handlers
  // ============================================================
  const toggleAgencia = (id: string) => {
    setExpandedAgencias(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAprobar = (invoiceId: string) => {
    updateInvoiceStatus(invoiceId, "aprobada_comisiones");
    toast.success("Factura aprobada", {
      description: "Lista para dispersión.",
    });
  };

  const handleRechazar = () => {
    if (!rechazoModal) return;
    if (!motivoRechazo.trim()) {
      toast.error("Indica el motivo del rechazo");
      return;
    }
    updateInvoiceStatus(rechazoModal.invoiceId, "rechazada_comisiones", motivoRechazo);
    toast.success("Factura rechazada");
    setRechazoModal(null);
    setMotivoRechazo("");
  };

  const handleMarcarDispersada = (invoiceId: string) => {
    markInvoiceDispersed(invoiceId);
  };

  const toggleForDispersion = (invoiceId: string) => {
    setSelectedForDispersion(prev => {
      const next = new Set(prev);
      if (next.has(invoiceId)) next.delete(invoiceId);
      else next.add(invoiceId);
      return next;
    });
  };

  const handleGenerarDispersion = () => {
    const selectedInvoices = invoices.filter(inv =>
      selectedForDispersion.has(inv.id) && inv.status === "aprobada_comisiones"
    );
    if (selectedInvoices.length === 0) {
      toast.error("Selecciona al menos una factura aprobada para dispersar");
      return;
    }
    if (!user) {
      toast.error("No hay usuario activo");
      return;
    }

    try {
      const txt = generarArchivoDispersion(selectedInvoices, user);
      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dispersion-${user.initials.toLowerCase()}-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Archivo de dispersión generado (${selectedInvoices.length} facturas)`, {
        description: `Titular: ${user.name} · Banco: ${user.banco}`,
      });
    } catch (err) {
      toast.error("No se pudo generar el archivo", {
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  };

  const format = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`bg-celeste-soft border border-celeste-subtle rounded-xl p-4`}>
        <h2 className="text-azul-oscuro font-semibold mb-1">Módulo de Comisiones</h2>
        <p className={`text-sm ${TEXT_SECONDARY}`}>
          Aprueba las facturas que ya pasaron por Cartera y genera el archivo plano de dispersión
          para que el equipo de pagos programe la transferencia.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Facturas en proceso" value={kpis.total} color="bg-azul-oscuro text-white" />
        <KPI label="Pendientes aprobación" value={kpis.pendientesAprobacion} color="bg-warning-soft text-warning border border-warning-border/30" />
        <KPI label="Aprobadas" value={kpis.aprobadas} color="bg-celeste-soft text-azul-oscuro border border-celeste-subtle" />
        <KPI label="Dispersadas" value={kpis.dispersadas} color="bg-success-soft text-success border border-success-border/30" />
      </div>

      {/* Toolbar */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar por ID, voucher o agencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
          />
        </div>
        <button
          onClick={handleGenerarDispersion}
          disabled={selectedForDispersion.size === 0}
          className={`${BTN_CTA} px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Download className="w-4 h-4" />
          Generar archivo de dispersión ({selectedForDispersion.size})
        </button>
      </div>

      {/* Lista agrupada por agencia */}
      {Object.keys(facturasPorAgencia).length === 0 ? (
        <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-12 text-center`}>
          <ShieldCheck className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-azul-oscuro font-semibold mb-1">Sin facturas para revisar</p>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Las facturas aparecerán aquí cuando Cartera las apruebe.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {agencias
            .filter(ag => facturasPorAgencia[ag.id])
            .map(agencia => {
              const facturas = facturasPorAgencia[agencia.id] ?? [];
              const isExpanded = expandedAgencias.has(agencia.id);
              const montoAgencia = facturas.reduce((s, f) => s + f.totalComision, 0);

              return (
                <div key={agencia.id} className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
                  {/* Header de la agencia (clickable) */}
                  <button
                    onClick={() => toggleAgencia(agencia.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-canvas transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-celeste-soft rounded-lg flex items-center justify-center">
                        <Filter className="w-5 h-5 text-azul-oscuro" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-azul-oscuro">{agencia.nombre}</h3>
                        <p className={`text-xs ${TEXT_SECONDARY}`}>
                          {agencia.codigoEVA} · {agencia.pais} · {facturas.length} factura{facturas.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-text-secondary">Total</p>
                        <p className="text-base font-bold text-azul-oscuro">${format(montoAgencia)}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-azul-oscuro" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-azul-oscuro" />
                      )}
                    </div>
                  </button>

                  {/* Lista de facturas */}
                  {isExpanded && (
                    <div className="border-t border-border-base">
                      {facturas.map(invoice => (
                        <FacturaRow
                          key={invoice.id}
                          invoice={invoice}
                          canApprove={canApprove}
                          canDispersar={canDispersar}
                          selected={selectedForDispersion.has(invoice.id)}
                          onSelect={() => toggleForDispersion(invoice.id)}
                          onAprobar={() => handleAprobar(invoice.id)}
                          onRechazar={() => setRechazoModal({ invoiceId: invoice.id })}
                          onMarcarDispersada={() => handleMarcarDispersada(invoice.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modal de rechazo */}
      {rechazoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6`}>
            <h3 className="text-azul-oscuro font-semibold mb-2">Rechazar factura {rechazoModal.invoiceId}</h3>
            <p className={`text-sm ${TEXT_SECONDARY} mb-4`}>
              Indica el motivo del rechazo. Esta acción se notificará al comercial.
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
                className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium`}
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-danger text-white hover:bg-danger/90 transition-colors"
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

function FacturaRow({
  invoice,
  canApprove,
  canDispersar,
  selected,
  onSelect,
  onAprobar,
  onRechazar,
  onMarcarDispersada,
}: {
  invoice: FacturaExpandida;
  canApprove: boolean;
  canDispersar: boolean;
  selected: boolean;
  onSelect: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
  onMarcarDispersada: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const format = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const canDisperse = invoice.status === "aprobada_comisiones" && canDispersar;
  const canSelect = invoice.status === "aprobada_comisiones";
  const canDoApprove = invoice.status === "en_comisiones" && canApprove;
  // También debe poder aprobar si está aprobada_cartera (debería estar en_comisiones pero por compatibilidad)
  const canDoApproveCartera = invoice.status === "aprobada_cartera" && canApprove;
  const isRejected = invoice.status === "rechazada_comisiones";

  return (
    <div className="border-b border-border-base last:border-0">
      <div className="px-5 py-3 flex items-center gap-3 hover:bg-canvas transition-colors">
        {canSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste"
            aria-label={`Seleccionar ${invoice.id} para dispersión`}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-azul-oscuro">{invoice.id}</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${invoiceStatusClass[invoice.status as InvoiceStatus]}`}>
              {invoiceStatusLabel[invoice.status as InvoiceStatus]}
            </span>
            {invoice.archivosValidados && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <FileCheck className="w-3 h-3" />
                Archivos OK
              </span>
            )}
          </div>
          <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
            {invoice.vouchers.length} voucher{invoice.vouchers.length !== 1 ? "s" : ""} · {invoice.fecha}
            {invoice.folioFiscal && ` · Folio: ${invoice.folioFiscal.slice(0, 8)}...`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-base font-bold text-azul-oscuro">${format(invoice.totalComision)}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-celeste hover:underline"
          >
            {expanded ? "Ocultar desglose fiscal" : "Ver desglose fiscal"}
          </button>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {canDoApproveCartera && (
            <button
              onClick={onAprobar}
              className={`${BTN_PRIMARY} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Aprobar
            </button>
          )}
          {canDoApprove && (
            <button
              onClick={onAprobar}
              className={`${BTN_PRIMARY} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Aprobar
            </button>
          )}
          {canApprove && !isRejected && (
            <button
              onClick={onRechazar}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger text-white hover:bg-danger/90 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Rechazar
            </button>
          )}
          {canDisperse && (
            <button
              onClick={onMarcarDispersada}
              className={`${BTN_CTA} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1`}
            >
              <Send className="w-3 h-3" />
              Marcar dispersada
            </button>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && invoice.fiscal && (
        <div className={`px-5 py-3 bg-canvas text-xs space-y-1.5`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-text-secondary uppercase tracking-wider">Base gravable</p>
              <p className="font-semibold text-azul-oscuro">${format(invoice.fiscal.baseGravable)}</p>
            </div>
            <div>
              <p className="text-text-secondary uppercase tracking-wider">IVA 19%</p>
              <p className="font-semibold text-info">+ ${format(invoice.fiscal.iva)}</p>
            </div>
            <div>
              <p className="text-text-secondary uppercase tracking-wider">Retefuente</p>
              <p className="font-semibold text-success">− ${format(invoice.fiscal.retefuente)}</p>
            </div>
            <div>
              <p className="text-text-secondary uppercase tracking-wider">Tipo cliente</p>
              <p className="font-semibold text-azul-oscuro capitalize">
                {invoice.fiscal.tipoCliente}
                {invoice.fiscal.aplicarISR && " · ISR"}
              </p>
            </div>
          </div>
          {invoice.rechazadaMotivo && (
            <div className={`${alertBg.danger} rounded-lg p-2 mt-2`}>
              <p className={`text-xs ${alertText.danger}`}>
                <strong>Motivo del rechazo:</strong> {invoice.rechazadaMotivo}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
