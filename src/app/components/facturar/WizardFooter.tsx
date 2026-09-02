// ============================================================
// Footer del wizard — Atrás / Siguiente / Radicar Factura
// ============================================================

import { ArrowLeft, ArrowRight, Send, Loader2, AlertCircle } from "lucide-react";
import { BTN_PRIMARY, BTN_CTA, BTN_SECONDARY } from "../../utils/ui";

interface WizardFooterProps {
  step: 1 | 2 | 3 | 4;
  canBack: boolean;
  canNext: boolean;
  canRadicar: boolean;
  isSubmitting: boolean;
  nextLabel?: string;
  nextHint?: string;
  /** Si true, el hint se muestra inline como warning bloqueante con icono */
  nextHintBlocking?: boolean;
  /** Callback al hacer click en el hint (ej. saltar a sección que falta) */
  onHintClick?: () => void;
  radicarHint?: string;
  onBack: () => void;
  onNext: () => void;
  onRadicar: () => void;
}

export function WizardFooter({
  step,
  canBack,
  canNext,
  canRadicar,
  isSubmitting,
  nextLabel,
  nextHint,
  nextHintBlocking = false,
  onHintClick,
  radicarHint,
  onBack,
  onNext,
  onRadicar,
}: WizardFooterProps) {
  return (
    // =================================================================
    // STICKY FOOTER BAR — CTA siempre visible (regla de oro de wizards).
    //
    // Antes (versión inline): el botón "Siguiente" quedaba al final del
    //   flujo del step → el usuario tenía que hacer scroll para encontrarlo
    //   → rompía la fluidez del wizard.
    //
    // Ahora: barra inferior translúcida fija al viewport.
    //   - `sticky bottom-0`: se mantiene visible al hacer scroll.
    //   - `z-50`: por encima del panel lateral (z-10).
    //   - `bg-white/80 backdrop-blur-md`: translúcido, deja ver contenido
    //     detrás pero sin saturar visualmente.
    //   - `shadow-[0_-4px_24px_rgba(0,24,76,0.10)]`: sombra azul corporativa
    //     hacia arriba, separa visualmente del contenido.
    //   - `border-t border-border-base/50`: línea sutil superior.
    //   - SIN `transform` (no se usa `-translate-x-1/2`) para no crear
    //     stacking context que rompa position: sticky en otros elementos.
    //   - El contenedor padre en FacturarPage.tsx tiene `pb-32` (128px)
    //     para que la última fila del contenido no quede tapada.
    // =================================================================
    <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-border-base/50 shadow-[0_-4px_24px_rgba(0,24,76,0.10)] -mx-4 px-4 pt-3 pb-4">
      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!canBack || isSubmitting}
          className={`${BTN_SECONDARY} px-4 py-2 rounded-full font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2 text-sm`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Atrás
        </button>

        {step < 4 ? (
          // `items-end` para que el hint (cuando aparece) quede alineado debajo
          // del botón, NO del "Atrás". `shrink-0` evita que el hint reduzca
          // su tamaño si el contenedor se angosta.
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              // CTA amarillo redondeado — acción primaria del wizard.
              className={`${BTN_CTA} px-5 py-2 rounded-full font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-oscuro focus-visible:ring-offset-2 disabled:hover:shadow-md text-sm`}
              title={nextHint}
              aria-describedby={nextHintBlocking ? "wizard-hint-blocking" : undefined}
            >
              {nextLabel ?? "Siguiente"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {nextHintBlocking && nextHint && !canNext ? (
              <button
                id="wizard-hint-blocking"
                type="button"
                onClick={onHintClick}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning border border-warning-border/30 bg-warning-soft px-2.5 py-1 rounded-full hover:bg-warning/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {nextHint}
              </button>
            ) : (
              nextHint && !canNext && (
                <p className="text-[11px] text-text-secondary">{nextHint}</p>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onRadicar}
              disabled={!canRadicar || isSubmitting}
              className={`${BTN_CTA} px-5 py-2 rounded-full font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-oscuro focus-visible:ring-offset-2 text-sm`}
              title={radicarHint ?? "Radicar la factura y enviarla a Cartera para revisión"}
              aria-describedby={radicarHint && !canRadicar ? "wizard-hint-blocking-final" : undefined}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin motion-safe:animate-spin" />
                  Radicando factura...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Radicar Factura
                </>
              )}
            </button>
            {radicarHint && !canRadicar && (
              <button
                id="wizard-hint-blocking-final"
                type="button"
                onClick={onHintClick}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning border border-warning-border/30 bg-warning-soft px-2.5 py-1 rounded-full hover:bg-warning/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {radicarHint}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
