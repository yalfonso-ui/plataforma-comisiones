// ============================================================
// PASO 4 — Confirmación final antes de radicar
// ============================================================

import { CheckCircle2, Receipt, Send } from "lucide-react";
import type { FiscalSnapshot } from "../../types/domain";
import type { Operation } from "../../store/appStore";
import { BORDER_DEFAULT, TEXT_SECONDARY, alertBg, alertIcon, alertText } from "../../utils/ui";

interface StepConfirmacionProps {
  selectedOps: Operation[];
  fiscal: FiscalSnapshot | null;
  tipoClienteLabel: string;
  xmlFile: File | null;
  pdfFile: File | null;
}

export function StepConfirmacion({
  selectedOps,
  fiscal,
  tipoClienteLabel,
  xmlFile,
  pdfFile,
}: StepConfirmacionProps) {
  const format = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      {/* Resumen final */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        <div className="bg-azul-oscuro text-white px-5 py-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-celeste" />
          <h4 className="text-sm font-semibold">Información de la factura</h4>
        </div>

        <div className="p-5 space-y-4">
          {/* Cliente */}
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-1">
              Cliente
            </p>
            <p className="text-sm text-azul-oscuro font-medium">
              {tipoClienteLabel}
              {fiscal?.aplicarISR ? " · con ISR" : " · sin ISR"}
            </p>
          </div>

          {/* Operaciones */}
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-1">
              Vouchers incluidos ({selectedOps.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedOps.map(op => (
                <span
                  key={op.id}
                  className="inline-block px-2 py-1 bg-canvas border border-border-base text-xs rounded text-azul-oscuro font-medium"
                >
                  {op.voucher}
                </span>
              ))}
            </div>
          </div>

          {/* Archivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border-base">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary uppercase">XML</p>
                <p className="text-xs text-azul-oscuro truncate">{xmlFile?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary uppercase">PDF</p>
                <p className="text-xs text-azul-oscuro truncate">{pdfFile?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose fiscal */}
      {fiscal && (
        <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-5`}>
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-3">
            Desglose fiscal
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={TEXT_SECONDARY}>Comisión bruta</span>
              <span className="font-medium text-azul-oscuro">${format(fiscal.comisionBruta)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={TEXT_SECONDARY}>+ IVA 19%</span>
              <span className="text-info">${format(fiscal.iva)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={TEXT_SECONDARY}>
                − Retefuente ({fiscal.tipoCliente === "juridica" ? "4%" : "10%"})
              </span>
              <span className="text-success">− ${format(fiscal.retefuente)}</span>
            </div>
            {fiscal.aplicarISR && (
              <div className="flex justify-between text-xs">
                <span className={TEXT_SECONDARY}>+ ISR 10%</span>
                <span className="text-warning">+ ${format(fiscal.isr)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border-base font-medium">
              <span className={TEXT_SECONDARY}>Total impuestos</span>
              <span className={fiscal.totalImpuestos < 0 ? "text-success" : "text-danger"}>
                {fiscal.totalImpuestos < 0 ? "−" : "+"} ${format(Math.abs(fiscal.totalImpuestos))}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t-2 border-azul-oscuro">
              <span className="font-semibold text-azul-oscuro">Total a recibir (neto)</span>
              <span className="text-lg font-bold text-celeste">
                ${format(fiscal.totalComision)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aviso */}
      <div className={`${alertBg.info} rounded-xl p-4 flex items-start gap-3`}>
        <Send className={`w-5 h-5 ${alertIcon.info} flex-shrink-0 mt-0.5`} />
        <div>
          <p className={`text-sm font-semibold ${alertText.info}`}>
            Al radicar, esta acción no se puede deshacer
          </p>
          <p className={`text-xs ${alertText.info} mt-1 opacity-80`}>
            La factura quedará en estado <strong>En Cartera</strong>. El equipo de Cartera
            revisará y aprobará tu factura para que pase a Comisiones y se programe el pago.
          </p>
        </div>
      </div>
    </div>
  );
}
