// ============================================================
// Stepper visual del wizard 1 → 2 → 3 → 4
// ============================================================

import { Check } from "lucide-react";

interface WizardHeaderProps {
  currentStep: 1 | 2 | 3 | 4;
  canGoToStep1: boolean;
  canGoToStep2: boolean;
  canGoToStep3: boolean;
  canGoToStep4: boolean;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

const STEPS = [
  { num: 1, label: "Operaciones", description: "1 o más vouchers" },
  { num: 2, label: "Cliente & ISR", description: "Tipo de cliente e impuestos" },
  { num: 3, label: "Archivos", description: "XML + PDF cruzados" },
  { num: 4, label: "Confirmar", description: "Revisar y radicar" },
] as const;

export function WizardHeader({
  currentStep,
  canGoToStep1,
  canGoToStep2,
  canGoToStep3,
  canGoToStep4,
  onStepClick,
}: WizardHeaderProps) {
  const reachability = [canGoToStep1, canGoToStep2, canGoToStep3, canGoToStep4];

  return (
    <nav aria-label="Pasos del wizard" className="bg-white rounded-xl shadow-sm border border-border-base p-4">
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, idx) => {
          const isActive = step.num === currentStep;
          const isComplete = step.num < currentStep;
          const isReachable = reachability[idx];

          const dotClass = isActive
            ? "bg-azul-oscuro border-azul-oscuro text-white"
            : isComplete
              ? "bg-success border-success text-white"
              : isReachable
                ? "bg-celeste-soft border-celeste text-azul-oscuro"
                : "bg-canvas border-border-base text-text-secondary";

          const labelClass = isActive
            ? "text-azul-oscuro font-semibold"
            : isComplete
              ? "text-success font-medium"
              : "text-text-secondary";

          return (
            <li key={step.num} className="flex-1 flex items-center">
              <button
                type="button"
                disabled={!isReachable && !isComplete}
                onClick={() => onStepClick?.(step.num as 1 | 2 | 3 | 4)}
                className={`flex items-center gap-3 w-full text-left transition-all ${
                  isReachable || isComplete ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors flex-shrink-0 ${dotClass}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${labelClass} truncate`}>{step.label}</p>
                  <p className="text-[10px] text-text-secondary truncate hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </button>

              {/* Línea conectora */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-0.5 flex-1 mx-2 transition-colors ${
                    step.num < currentStep ? "bg-success" : "bg-border-base"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
