import { useState, useMemo } from "react";
import { FileText, Download, Eye, CheckCircle2, Clock, XCircle, Plus, X, FileCheck, FileCode2, AlertCircle } from "lucide-react";
import { useAppStore, Invoice } from "../store/appStore";
import { DateFilter } from "./DateFilter";
import { useDateFilterStore, getDateRange } from "../store/dateFilterStore";
import { toast } from "sonner";
import { Link } from "react-router";
import {
  BTN_CTA,
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  alertBg,
  alertText,
  invoiceStatusClass,
} from "../utils/ui";

export function Historial() {
  const invoices = useAppStore((state) => state.invoices);
  const updateInvoiceStatus = useAppStore((state) => state.updateInvoiceStatus);
  const resetData = useAppStore((state) => state.resetData);
  const [filter, setFilter] = useState<"all" | "procesando" | "aprobada" | "rechazada">("all");
  const { period, customStartDate, customEndDate } = useDateFilterStore();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const hasFilters = filter !== "all" || period !== "mes-corrido" || !!customStartDate || !!customEndDate;

  const dateRange = useMemo(() => getDateRange(period, customStartDate, customEndDate), [period, customStartDate, customEndDate]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = filter === "all" || inv.status === filter;
      const invDate = new Date(inv.fecha);
      const matchesDate = invDate >= dateRange.startDate && invDate <= dateRange.endDate;
      return matchesStatus && matchesDate;
    });
  }, [invoices, filter, dateRange]);

  const handleDownloadInvoice = (invoice: Invoice, type: "xml" | "pdf") => {
    if (invoice.status === "rechazada") {
      toast.error("Factura rechazada", {
        description: "Esta factura no puede descargarse. Genera una nueva factura corregida.",
      });
      return;
    }

    const fileName = type === "xml" ? invoice.xmlFileName : invoice.pdfFileName;
    let content = "";
    let mimeType = "";

    if (type === "xml") {
      content = generateSampleXML(invoice);
      mimeType = "application/xml";
    } else {
      content = generateSamplePDFContent(invoice);
      mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Descargado: ${fileName}`);
  };

  const clearFilters = () => setFilter("all");

  const resetToDemo = () => {
    if (confirm("¿Restaurar las facturas a los datos de demostración?")) {
      resetData();
      toast.success("Datos restaurados");
    }
  };

  const handleApproveDemo = () => {
    if (!selectedInvoice) return;
    updateInvoiceStatus(selectedInvoice.id, "aprobada");
    setSelectedInvoice({ ...selectedInvoice, status: "aprobada" });
  };
  const handleRejectDemo = () => {
    if (!selectedInvoice) return;
    const motivo = prompt("Motivo del rechazo:", "Datos fiscales incorrectos");
    if (motivo === null) return;
    updateInvoiceStatus(selectedInvoice.id, "rechazada", motivo);
    setSelectedInvoice({ ...selectedInvoice, status: "rechazada", rechazadaMotivo: motivo });
  };

  const totales = useMemo(() => ({
    total: filteredInvoices.reduce((sum, inv) => sum + inv.totalComision, 0),
    aprobadas: filteredInvoices.filter((inv) => inv.status === "aprobada").length,
    procesando: filteredInvoices.filter((inv) => inv.status === "procesando").length,
  }), [filteredInvoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-azul-oscuro mb-2">Historial de Facturas</h2>
        <p className={`text-sm ${TEXT_SECONDARY}`}>Consulta y descarga todas tus facturas enviadas</p>
      </div>

      {/* Filters Row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            aria-label="Filtrar por estado"
            className={`px-4 py-2 bg-white border ${BORDER_DEFAULT} rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste hover:border-celeste transition-colors text-sm font-medium text-azul-oscuro`}
          >
            <option value="all">Todos los estados</option>
            <option value="procesando">En proceso</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className={`text-xs text-azul-oscuro hover:text-celeste underline`}>
              Limpiar
            </button>
          )}
        </div>
        <DateFilter />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Facturado" value={`$${totales.total.toLocaleString("es-MX")} MXN`} icon={<FileText className="w-5 h-5" />} color="bg-azul-oscuro text-white" />
        <StatCard label="Facturas Aprobadas" value={totales.aprobadas} icon={<CheckCircle2 className="w-5 h-5" />} color="bg-success-soft text-success border border-success-border/30" />
        <StatCard label="En Proceso" value={totales.procesando} icon={<Clock className="w-5 h-5" />} color="bg-warning-soft text-warning border border-warning-border/30" />
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        {filteredInvoices.length === 0 ? (
          hasFilters ? (
            <div className="p-12 text-center" role="status" aria-live="polite">
              <div className="w-20 h-20 mx-auto bg-canvas rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-text-secondary" />
              </div>
              <p className="text-azul-oscuro mb-2 font-semibold">Sin resultados para los filtros aplicados</p>
              <p className={`text-sm ${TEXT_SECONDARY} mb-6 max-w-md mx-auto`}>
                No se encontraron facturas que coincidan con los filtros de estado o fecha.
              </p>
              <button
                onClick={clearFilters}
                className={`${BTN_SECONDARY} inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium`}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="p-12 text-center" role="status" aria-live="polite">
              <div className="w-20 h-20 mx-auto bg-canvas rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-text-secondary" />
              </div>
              <p className="text-azul-oscuro mb-2 font-semibold">Aún no has enviado facturas</p>
              <p className={`text-sm ${TEXT_SECONDARY} mb-6 max-w-md mx-auto`}>
                Las facturas que envíes desde la sección "Facturar" aparecerán aquí con su estado y archivos adjuntos.
              </p>
              <Link
                to="/facturar"
                className={`${BTN_CTA} inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold`}
              >
                <Plus className="w-4 h-4" />
                Ir a Facturar
              </Link>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas border-b border-border-base">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">ID Factura</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Vouchers</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Total Liquidado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Total Comisión</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-azul-oscuro">{invoice.id}</span>
                      {invoice.folioFiscal && (
                        <p className={`text-[10px] ${TEXT_SECONDARY} font-mono mt-0.5`} title={invoice.folioFiscal}>
                          {invoice.folioFiscal.slice(0, 8)}...
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${TEXT_SECONDARY}`}>{invoice.fecha}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {invoice.vouchers.slice(0, 2).map((v) => (
                          <span key={v} className={`inline-block px-2 py-1 bg-canvas border ${BORDER_DEFAULT} ${TEXT_SECONDARY} text-xs rounded`}>
                            {v}
                          </span>
                        ))}
                        {invoice.vouchers.length > 2 && (
                          <span className={`inline-block px-2 py-1 bg-canvas border ${BORDER_DEFAULT} ${TEXT_SECONDARY} text-xs rounded`}>
                            +{invoice.vouchers.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm ${TEXT_SECONDARY}`}>${invoice.totalLiquidado.toLocaleString("es-MX")}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-azul-oscuro">${invoice.totalComision.toLocaleString("es-MX")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        {/* Ver detalle — celeste: lectura / vista previa */}
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          aria-label={`Ver detalle de ${invoice.id}`}
                          className="group p-2 rounded-lg transition-all duration-150 hover:bg-celeste-soft hover:scale-105 active:scale-95"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4 text-text-secondary group-hover:text-azul-oscuro transition-colors" />
                        </button>
                        {/* Descargar PDF — danger: documento / archivo rojo */}
                        <button
                          onClick={() => handleDownloadInvoice(invoice, "pdf")}
                          aria-label={`Descargar PDF de ${invoice.id}`}
                          disabled={invoice.status === "rechazada"}
                          className="group p-2 rounded-lg transition-all duration-150 hover:bg-danger-soft hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                          title="Descargar PDF"
                        >
                          <FileCheck className="w-4 h-4 text-text-secondary group-hover:text-danger transition-colors" />
                        </button>
                        {/* Descargar XML — info: código / datos */}
                        <button
                          onClick={() => handleDownloadInvoice(invoice, "xml")}
                          aria-label={`Descargar XML de ${invoice.id}`}
                          disabled={invoice.status === "rechazada"}
                          className="group p-2 rounded-lg transition-all duration-150 hover:bg-info-soft hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                          title="Descargar XML"
                        >
                          <FileCode2 className="w-4 h-4 text-text-secondary group-hover:text-info transition-colors" />
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

      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownloadInvoice}
        onApproveDemo={handleApproveDemo}
        onRejectDemo={handleRejectDemo}
        onResetDemo={resetToDemo}
      />

      {/* Botón sutil para reset demo */}
      {filteredInvoices.length > 0 && (
        <div className="text-right">
          <button
            onClick={resetToDemo}
            className={`text-xs ${TEXT_SECONDARY} hover:text-azul-oscuro underline transition-colors`}
          >
            Restaurar datos demo
          </button>
        </div>
      )}
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

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const config = {
    procesando: { label: "En proceso", icon: Clock },
    aprobada: { label: "Aprobada", icon: CheckCircle2 },
    rechazada: { label: "Rechazada", icon: XCircle },
  };
  const { label, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${invoiceStatusClass[status]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function InvoiceDetailModal({ invoice, onClose, onDownload, onApproveDemo, onRejectDemo }: {
  invoice: Invoice | null;
  onClose: () => void;
  onDownload: (invoice: Invoice, type: "xml" | "pdf") => void;
  onApproveDemo: () => void;
  onRejectDemo: () => void;
  onResetDemo: () => void;
}) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Detalle de factura">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className={`flex items-center justify-between p-6 border-b border-border-base`}>
          <div>
            <h3 className="text-azul-oscuro font-semibold text-lg">{invoice.id}</h3>
            <p className={`text-sm ${TEXT_SECONDARY}`}>Enviada el {invoice.fecha}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-canvas rounded-lg" aria-label="Cerrar">
            <X className={`w-5 h-5 ${TEXT_SECONDARY}`} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={invoice.status} />
            {invoice.folioFiscal && (
              <span className={`text-xs ${TEXT_SECONDARY} font-mono`} title="Folio fiscal UUID">UUID: {invoice.folioFiscal.slice(0, 8)}...</span>
            )}
          </div>

          {/* Alerta Danger: rechazo */}
          {invoice.status === "rechazada" && invoice.rechazadaMotivo && (
            <div className={`${alertBg.danger} rounded-lg p-4`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-semibold ${alertText.danger}`}>Motivo del rechazo</p>
                  <p className={`text-sm text-danger mt-1`}>{invoice.rechazadaMotivo}</p>
                </div>
              </div>
            </div>
          )}

          {invoice.rfc && (
            <div className={`bg-canvas rounded-xl p-5 space-y-3`}>
              <h4 className="text-sm font-semibold text-azul-oscuro uppercase tracking-wide">Datos fiscales</h4>
              <Row label="RFC" value={invoice.rfc} />
              <Row label="Razón social" value={invoice.razonSocial ?? "—"} />
              <Row label="Folio fiscal" value={invoice.folioFiscal ?? "—"} mono />
            </div>
          )}

          <div className={`bg-canvas rounded-xl p-5 space-y-3`}>
            <h4 className="text-sm font-semibold text-azul-oscuro uppercase tracking-wide">
              Vouchers incluidos ({invoice.vouchers.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {invoice.vouchers.map((v) => (
                <span key={v} className={`inline-block px-2 py-1 bg-white border ${BORDER_DEFAULT} ${TEXT_SECONDARY} text-xs rounded`}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-info-soft rounded-xl p-4">
              <p className="text-xs text-info uppercase tracking-wide">Total liquidado</p>
              <p className="text-2xl font-bold text-info-border mt-1">${invoice.totalLiquidado.toLocaleString("es-MX")}</p>
            </div>
            <div className="bg-success-soft rounded-xl p-4">
              <p className="text-xs text-success uppercase tracking-wide">Total comisión</p>
              <p className="text-2xl font-bold text-success-border mt-1">${invoice.totalComision.toLocaleString("es-MX")}</p>
            </div>
          </div>

          {/* Demo controls: alerta warning + acciones */}
          {invoice.status === "procesando" && (
            <div className={`${alertBg.warning} rounded-xl p-4`}>
              <p className={`text-xs font-semibold ${alertText.warning} uppercase tracking-wide mb-2`}>Demo: simular respuesta</p>
              <div className="flex gap-2">
                <button
                  onClick={onApproveDemo}
                  className="flex-1 px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium"
                >
                  Aprobar
                </button>
                <button
                  onClick={onRejectDemo}
                  className="flex-1 px-3 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm font-medium"
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 border-t ${BORDER_DEFAULT} flex flex-wrap gap-3 justify-end`}>
          <button
            onClick={() => onDownload(invoice, "pdf")}
            disabled={invoice.status === "rechazada"}
            className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50`}
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => onDownload(invoice, "xml")}
            disabled={invoice.status === "rechazada"}
            className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50`}
          >
            <Download className="w-4 h-4" />
            XML
          </button>
          <button onClick={onClose} className={`${BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-medium`}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${TEXT_SECONDARY}`}>{label}</span>
      <span className={`text-sm font-medium text-azul-oscuro ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function generateSampleXML(invoice: Invoice): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  Version="4.0" Serie="C" Folio="${invoice.id}"
  Fecha="${invoice.fecha}T12:00:00"
  Total="${invoice.totalComision.toFixed(2)}"
  SubTotal="${(invoice.totalComision / 1.16).toFixed(2)}"
  Moneda="MXN" TipoDeComprobante="I" Exportacion="01"
  LugarExpedicion="11000"
  Sello="DEMO_SELLO_CONTINENTAL"
  NoCertificado="00001000000512345678"
  Certificado="DEMO_CERT">
  <cfdi:Emisor Rfc="CON080828RA2" Nombre="Continental Seguros SA" RegimenFiscal="601" />
  <cfdi:Receptor Rfc="${invoice.rfc ?? "XAXX010101000"}" Nombre="${invoice.razonSocial ?? "Receptor Demo"}" DomicilioFiscalReceptor="11000" RegimenFiscalReceptor="605" UsoCFDI="G03" />
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84121500" Cantidad="1" ClaveUnidad="E48" Unidad="Servicio" Descripcion="Comisiones por intermediación - Periodo ${invoice.fecha}" ValorUnitario="${(invoice.totalComision / 1.16).toFixed(2)}" Importe="${(invoice.totalComision / 1.16).toFixed(2)}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${(invoice.totalComision / 1.16).toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${(invoice.totalComision - invoice.totalComision / 1.16).toFixed(2)}" />
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${(invoice.totalComision - invoice.totalComision / 1.16).toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${(invoice.totalComision - invoice.totalComision / 1.16).toFixed(2)}" />
    </cfdi:Traslados>
  </cfdi:Impuestos>
</cfdi:Comprobante>
<!-- Vouchers: ${invoice.vouchers.join(", ")} -->
<!-- UUID: ${invoice.folioFiscal ?? "PENDIENTE"} -->
`;
}

function generateSamplePDFContent(invoice: Invoice): string {
  return `==========================================
  CONTINENTAL SEGUROS - CFDI 4.0
==========================================

Folio interno:        ${invoice.id}
Fecha de emisión:     ${invoice.fecha}
UUID (folio fiscal):  ${invoice.folioFiscal ?? "PENDIENTE"}

EMISOR
  Razón social:        Continental Seguros SA
  RFC:                 CON080828RA2

RECEPTOR
  Razón social:        ${invoice.razonSocial ?? "—"}
  RFC:                 ${invoice.rfc ?? "—"}

CONCEPTO
  Comisiones por intermediación aseguradora
  Periodo:             ${invoice.fecha}

VOUCHERS INCLUIDOS
${invoice.vouchers.map((v) => "  - " + v).join("\n")}

DESGLOSE
  Subtotal:            $${(invoice.totalComision / 1.16).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
  IVA 16%:             $${(invoice.totalComision - invoice.totalComision / 1.16).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
  -----------------------------------------
  TOTAL:               $${invoice.totalComision.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN

ESTADO:               ${invoice.status.toUpperCase()}

Para el PDF real, el servicio entregaría un PDF/A
con sello digital del SAT.

==========================================
  Este archivo es representativo - demo
==========================================
`;
}
