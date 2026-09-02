// ============================================================
// Panel lateral SIEMPRE visible con el resumen fiscal completo
// Reemplaza el antiguo "Ver detalle" — el resumen vive siempre
// ============================================================

import { useMemo, useState } from "react";
import type { FiscalSnapshot, TipoCliente } from "../../types/domain";
import { TEXT_SECONDARY, BORDER_DEFAULT, alertBg, alertIcon, alertText } from "../../utils/ui";
import { Calculator, FileCheck, AlertCircle, Receipt, ArrowRight } from "lucide-react";

interface SelectedOpLite {
  base?: number;
  porcentaje?: number;
  comision?: number;
}

interface ResumenFacturacionProps {
  fiscal: FiscalSnapshot | null;
  tipoCliente: TipoCliente | null;
  selectedCount: number;
  /** Operaciones seleccionadas (con campos fiscales completos). */
  selectedOps: SelectedOpLite[];
  /** Step activo del wizard — para mensajes contextuales */
  currentStep?: 1 | 2 | 3 | 4;
  /** Callback para saltar a una sección del wizard (anchor link) */
  onJumpTo?: (sectionId: string) => void;
}

/**
 * Panel lateral sticky — comportamiento "carrito flotante persistente"
 * (estilo Mercado Libre).
 *
 * El panel se mantiene anclado al top del viewport durante todo el scroll,
 * sin scroll interno y sin desaparecer hasta que el contenedor padre
 * (grid del wizard) salga del viewport. El usuario hace scroll en la
 * tabla de la izquierda y el resumen permanece visible en paralelo,
 * permitiendo ver los totales actualizándose en tiempo real.
 *
 * Layout:
 *  - Contenedor `<aside>` es sticky dentro del grid (col-span-1).
 *  - `top-24` (96px) = navbar (h-16 = 64px) + breadcrumb + padding main
 *    (~32px). Equivale a la altura a la que está el título del step
 *    activo — el panel queda alineado con él al hacer scroll.
 *  - `max-h-[calc(100vh-112px)]` = viewport - top-24 - margen inferior (16px).
 *    Limita la altura para que cuando el contenido crezca (impuestos
 *    desplegados) no desborde por debajo del fold.
 *  - `z-10` explícito para que el panel viva en su propio stacking context
 *    (sin chocar con header `z-30`, sidebar `z-10`, modal `z-50`, footer sticky `z-50`).
 *  - SIN `overflow-y-auto`: el panel NO tiene scroll interno. El usuario
 *    hace scroll en la página y el panel se mantiene anclado al top
 *    del viewport. Si el contenido del panel excede `max-h`, queda
 *    cortado por abajo (no scrolleable) — pero el contenido crítico
 *    siempre cabe en este alto.
 *  - `self-start` en el contenedor padre para que sticky funcione
 *    correctamente (sin esto, el aside se estira al alto del hermano
 *    y el sticky queda anulado).
 *
 * Notas:
 *  - El padre grid NO debe tener `overflow: hidden` para que sticky funcione.
 *  - Para que el sticky funcione durante TODO el scroll del contenido
 *    del step, el contenedor padre (`<div className="grid">` en FacturarPage)
 *    debe tener suficiente altura. El pb-32/lg:pb-36 que añadimos
 *    a la columna izquierda garantiza esto.
 */
export function ResumenFacturacion({ fiscal, tipoCliente, selectedCount, selectedOps, currentStep, onJumpTo }: ResumenFacturacionProps) {
  const [showTaxes, setShowTaxes] = useState(false);

  // Cálculos derivados DIRECTAMENTE de selectedOps.
  // Importante: NO depender de `fiscal` aquí, porque `fiscal` es null
  // mientras el usuario no haya elegido tipo de cliente. La sección
  // "Valor Base" debe mostrar datos reales desde el paso 1.
  const baseGravable = useMemo(
    () => selectedOps.reduce((s, o) => s + (o.base ?? 0), 0),
    [selectedOps]
  );
  const comisionBruta = useMemo(
    () => selectedOps.reduce((s, o) => s + (o.comision ?? 0), 0),
    [selectedOps]
  );
  const porcentajePromedio = selectedOps.length
    ? selectedOps.reduce((s, o) => s + (o.porcentaje ?? 0), 0) / selectedOps.length
    : 0;

  const format = (n: number) =>
    n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // El neto solo existe cuando hay fiscal. Si no, NO mostramos número
  // (sería engañoso llamarlo "neto" cuando es la comisión bruta).
  const hasFiscal = fiscal !== null;
  const showNetAmount = hasFiscal && tipoCliente !== null;

  // Mensaje contextual según el step y estado.
  // Cada hint puede incluir `targetId` + `actionLabel` para ser
  // interactivo (anchor link al campo que falta).
  // IMPORTANTE: Los mensajes del stepHint son contextuales al estado
  // del usuario (qué le falta). Los `hints` del FacturarPage son
  // los mensajes "estándar" que muestra el footer (pill warning).
  // Ambos hablan el mismo idioma para no crear redundancia visual.
  const stepHint: {
    msg: string;
    tone: "info" | "success" | "warning";
    targetId?: string;
    actionLabel?: string;
  } | null = (() => {
    if (currentStep === 1) {
      return selectedCount > 0
        ? { msg: `${selectedCount} operación${selectedCount > 1 ? "es" : ""} lista${selectedCount > 1 ? "s" : ""} — continúa al paso 2`, tone: "success" }
        : { msg: "Selecciona al menos una operación", tone: "warning" };
    }
    if (currentStep === 2) {
      return !tipoCliente
        ? {
            // Texto unificado con el hint del footer (FacturarPage hints[2])
            msg: "Selecciona el tipo de cliente",
            tone: "warning",
            targetId: "step2-tipo-cliente",
            actionLabel: "Ir a tipo de cliente",
          }
        : hasFiscal
          ? { msg: "Cálculo fiscal listo. Continúa al paso 3", tone: "success" }
          : null;
    }
    if (currentStep === 3 || currentStep === 4) {
      return hasFiscal
        ? { msg: "Todo listo. Revisa el resumen y radica la factura", tone: "success" }
        : null;
    }
    return null;
  })();

  return (
    // =================================================================
    // PANEL LATERAL STICKY — scroll global de página (no interno)
    //
    // Arquitectura final:
    // - La página entera scrollea de forma natural.
    // - El <aside> usa `sticky top-24` para anclarse al viewport a la
    //   altura del título del step.
    // - `max-h-[calc(100vh-7rem)]` limita la altura del panel para
    //   que cuando el contenido crece (impuestos desplegados), no
    //   desborde por debajo del fold. Sin overflow interno — el
    //   contenido que no cabe queda cortado por abajo (no scrolleable)
    //   y el contenido crítico (cabecera + valor base + total) siempre cabe.
    // - `z-10` para vivir en su propio stacking context sin chocar con
    //   header (z-30), modal (z-50) ni footer fijo (z-50).
    // - SIN `transform`, sin `filter`, sin `will-change`, sin `contain`
    //   en ningún ancestro — todos rompen position: sticky.
    // - SIN `overflow-y-auto` interno — eso crearía un nuevo scroll
    //   container que anula el sticky.
    // - El contenedor padre <div className="lg:col-span-1 self-start">
    //   en FacturarPage.tsx provee `align-self: start` (CRÍTICO en
    //   CSS Grid para que sticky funcione — sin esto, el item se estira
    //   al alto del hermano y el sticky queda anulado).
    // =================================================================
    <aside
      className="self-start sticky top-24 z-10 max-h-[calc(100vh-9rem)] space-y-1.5"
    >
      {/* Cabecera — más compacta (p-3 → p-2.5) */}
      <div className="bg-azul-oscuro rounded-xl shadow-lg p-2.5 text-white">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-celeste" />
          <h3 className="text-sm font-semibold text-white">Resumen de Facturación</h3>
        </div>
        <p className="text-[11px] text-white/70 mt-0.5">
          Actualizado en tiempo real al modificar la selección
        </p>
      </div>

      {/* Valor Base — siempre visible desde el paso 1.
          Tipografía más densa: títulos xs, valores text-sm, padding reducido. */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-2.5 space-y-1`}>
        <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
          Valor Base
        </p>
        <div className="flex justify-between items-baseline">
          <span className={`text-xs ${TEXT_SECONDARY}`}>Operaciones seleccionadas</span>
          <span className="text-xl font-bold text-azul-oscuro">{selectedCount}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className={`text-xs ${TEXT_SECONDARY}`}>Base liquidable</span>
          <span className="text-sm font-semibold text-azul-oscuro">
            ${format(baseGravable)}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className={`text-xs ${TEXT_SECONDARY}`}>% promedio</span>
          <span className="text-sm font-semibold text-azul-oscuro">
            {porcentajePromedio.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Impuestos — solo visible con tipo cliente elegido */}
      {hasFiscal && fiscal ? (
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-2.5 space-y-1`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
              Impuestos aplicados
            </p>
            <button
              type="button"
              onClick={() => setShowTaxes(!showTaxes)}
              className="text-[10px] text-celeste hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2 rounded"
            >
              {showTaxes ? "Ocultar desglose" : "Ver desglose"}
            </button>
          </div>

          {showTaxes && (
            <div className="space-y-1 pb-2 border-b border-border-base">
              <div className="flex justify-between text-xs">
                <span className={TEXT_SECONDARY}>IVA (19%)</span>
                <span className="font-medium text-azul-oscuro">+ ${format(fiscal.iva)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={TEXT_SECONDARY}>
                  Retefuente ({tipoCliente === "natural" ? "10%" : "4%"})
                </span>
                <span className="font-medium text-success">− ${format(fiscal.retefuente)}</span>
              </div>
              {fiscal.reteica > 0 && (
                <div className="flex justify-between text-xs">
                  <span className={TEXT_SECONDARY}>ReteICA</span>
                  <span className="font-medium text-success">− ${format(fiscal.reteica)}</span>
                </div>
              )}
              {fiscal.aplicarISR && (
                <div className="flex justify-between text-xs">
                  <span className={TEXT_SECONDARY}>ISR (10%)</span>
                  <span className="font-medium text-warning">+ ${format(fiscal.isr)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-baseline">
            <span className={`text-sm ${TEXT_SECONDARY}`}>Total impuestos</span>
            <span className={`text-base font-semibold ${fiscal.totalImpuestos < 0 ? "text-success" : "text-danger"}`}>
              {fiscal.totalImpuestos < 0 ? "−" : "+"} ${format(Math.abs(fiscal.totalImpuestos))}
            </span>
          </div>
        </div>
      ) : (
        <div className={`${alertBg.warning} rounded-xl p-2.5 flex items-start gap-2`}>
          <AlertCircle className={`w-4 h-4 ${alertIcon.warning} flex-shrink-0 mt-0.5`} />
          <p className={`text-xs ${alertText.warning}`}>
            Impuestos se calculan al elegir tipo de cliente.
          </p>
        </div>
      )}

      {/* Total final — label dinámico para evitar el bug "Neto = Bruto" */}
      <div className="bg-gradient-to-br from-azul-oscuro to-[#002a6e] rounded-xl shadow-lg p-2.5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Receipt className="w-3 h-3 text-celeste" />
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
            {showNetAmount ? "Total a Comisión (neto)" : "Total Comisión (bruta)"}
          </p>
        </div>
        {showNetAmount && fiscal ? (
          <>
            <p className="text-2xl font-bold text-celeste mb-0.5">
              ${format(fiscal.totalComision)}
            </p>
            <p className="text-xs text-white/70">
              {tipoCliente === "natural" ? "Persona Natural" : "Persona Jurídica"}
              {fiscal.aplicarISR ? " · con ISR" : " · sin ISR"}
              {" · neto después de impuestos"}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-white/90 mb-0.5">
              ${format(comisionBruta)}
            </p>
            <p className="text-xs text-white/70">
              {tipoCliente === "natural" ? "Persona Natural" :
               tipoCliente === "juridica" ? "Persona Jurídica" :
               "Selecciona tipo de cliente"}
              {selectedCount > 0 && !tipoCliente ? " · faltan impuestos por calcular" : ""}
            </p>
          </>
        )}
      </div>

      {/* Indicador contextual por step.
          Si el hint es interactivo (tiene targetId), se renderiza como <button>
          que llama a onJumpTo() — esto permite al usuario saltar directamente
          al campo que necesita atención. */}
      {stepHint && (() => {
        const Icon = stepHint.tone === "success" ? FileCheck : AlertCircle;
        const bgClass =
          stepHint.tone === "success" ? alertBg.success :
          stepHint.tone === "warning" ? alertBg.warning :
          alertBg.info;
        const textClass =
          stepHint.tone === "success" ? alertText.success :
          stepHint.tone === "warning" ? alertText.warning :
          alertText.info;
        const iconClass =
          stepHint.tone === "success" ? alertIcon.success :
          stepHint.tone === "warning" ? alertIcon.warning :
          alertIcon.info;

        const inner = (
          <>
            <Icon className={`w-4 h-4 ${iconClass} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${textClass}`}>{stepHint.msg}</p>
              {stepHint.targetId && stepHint.actionLabel && (
                <div className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${
                  stepHint.tone === "warning" ? "text-warning" :
                  stepHint.tone === "success" ? "text-success" :
                  "text-info"
                }`}>
                  {stepHint.actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </>
        );

        if (stepHint.targetId && onJumpTo) {
          return (
            <button
              type="button"
              onClick={() => onJumpTo(stepHint.targetId!)}
              className={`w-full text-left rounded-xl p-3 flex items-start gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2 ${bgClass}`}
              role="status"
              aria-live="polite"
            >
              {inner}
            </button>
          );
        }

        return (
          <div
            className={`rounded-xl p-3 flex items-start gap-2 ${bgClass}`}
            role="status"
            aria-live="polite"
          >
            {inner}
          </div>
        );
      })()}
    </aside>
  );
}

