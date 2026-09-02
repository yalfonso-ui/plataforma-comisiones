// ============================================================
// PASO 2 — Tipo de cliente + ISR
// El cálculo fiscal se actualiza en vivo en el panel lateral
// ============================================================

import { Building2, User, Info, Calculator } from "lucide-react";
import type { TipoCliente } from "../../types/domain";
import { BORDER_DEFAULT, TEXT_SECONDARY } from "../../utils/ui";

interface StepClienteImpuestosProps {
  tipoCliente: TipoCliente | null;
  aplicarISR: boolean;
  onTipoChange: (tipo: TipoCliente) => void;
  onISRChange: (aplicar: boolean) => void;
  /** Cuando true, la sección "Tipo de cliente" muestra un badge inline
   *  "requerido" + una animación de pulso sutil para guiar al usuario. */
  highlightRequired?: boolean;
}

export const SECTION_IDS = {
  tipoCliente: "step2-tipo-cliente",
  isr: "step2-isr",
} as const;

export function StepClienteImpuestos({
  tipoCliente,
  aplicarISR,
  onTipoChange,
  onISRChange,
  highlightRequired = false,
}: StepClienteImpuestosProps) {
  return (
    // =================================================================
    // PASO 2 — Tipo de cliente + ISR
    // Layout compacto y horizontal-friendly:
    //  - En lg: header + tipo de cliente + ISR + cálculo van en una sola
    //    columna estrecha con espaciado vertical denso (space-y-3).
    //  - Esto evita que el formulario se "estire" hacia abajo y cree
    //    contraste de ritmo con el panel derecho.
    // =================================================================
    <div className="space-y-3">
      {/* Header — más compacto */}
      <div className={`bg-celeste-soft border border-celeste-subtle rounded-xl p-3`}>
        <h3 className="text-azul-oscuro font-semibold text-sm mb-0.5">Paso 2 — Cliente e impuestos</h3>
        <p className={`text-xs ${TEXT_SECONDARY}`}>
          Selecciona el tipo de cliente y si aplica ISR. El resumen de la derecha se actualiza en tiempo real.
        </p>
      </div>

      {/* Tipo de cliente — id para scroll-asistido */}
      <div
        id={SECTION_IDS.tipoCliente}
        className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4 transition-colors ${
          highlightRequired && !tipoCliente ? "border-warning-border/40 bg-warning-soft/30" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-semibold text-azul-oscuro">
            Tipo de cliente <span className="text-danger">*</span>
          </p>
          {highlightRequired && !tipoCliente && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-warning border border-warning-border/40 bg-warning-soft px-2 py-0.5 rounded-full">
              <Info className="w-3 h-3" />
              Requerido
            </span>
          )}
        </div>

        {/* Radio cards — padding reducido de p-4 a p-3 para compactar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de cliente">
          <label
            className={`flex items-start gap-2.5 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              tipoCliente === "juridica"
                ? "border-celeste bg-celeste-soft"
                : `${BORDER_DEFAULT} border hover:border-celeste`
            }`}
          >
            <input
              type="radio"
              name="tipoCliente"
              value="juridica"
              checked={tipoCliente === "juridica"}
              onChange={() => onTipoChange("juridica")}
              className="w-4 h-4 mt-0.5 accent-azul-oscuro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-azul-oscuro" />
                <p className="text-sm font-semibold text-azul-oscuro">Persona Jurídica</p>
              </div>
              <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
                Empresa. Retefuente reducida (4%).
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-2.5 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              tipoCliente === "natural"
                ? "border-celeste bg-celeste-soft"
                : `${BORDER_DEFAULT} border hover:border-celeste`
            }`}
          >
            <input
              type="radio"
              name="tipoCliente"
              value="natural"
              checked={tipoCliente === "natural"}
              onChange={() => onTipoChange("natural")}
              className="w-4 h-4 mt-0.5 accent-azul-oscuro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-azul-oscuro" />
                <p className="text-sm font-semibold text-azul-oscuro">Persona Natural</p>
              </div>
              <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
                Persona individual. Honorarios (10%).
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Toggle ISR — más compacto (p-4 → p-3, mt-1 → mt-0.5) */}
      <div
        id={SECTION_IDS.isr}
        className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-3 transition-opacity ${
          !tipoCliente ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-azul-oscuro">Aplicar ISR</p>
            <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
              Activa si aplica Impuesto Sobre la Renta. Cálculo: <strong>IVA − Retefuente + ISR</strong>.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={aplicarISR}
            aria-label="Aplicar ISR"
            aria-disabled={!tipoCliente}
            onClick={() => onISRChange(!aplicarISR)}
            disabled={!tipoCliente}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
              aplicarISR ? "bg-celeste" : "bg-border-base"
            } ${!tipoCliente ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste focus-visible:ring-offset-2`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                aplicarISR ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {!tipoCliente && (
          <div className="mt-2 flex items-start gap-2 text-xs text-text-secondary">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Selecciona el tipo de cliente para habilitar el ISR.
          </div>
        )}
      </div>

      {/* Mensaje fiscal — más compacto (p-4 → p-3, leading-relaxed → leading-snug) */}
      {tipoCliente && (
        <div className="bg-azul-oscuro text-white rounded-xl p-3 flex items-start gap-2.5">
          <Calculator className="w-4 h-4 text-celeste flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1">Cálculo fiscal colombiano</p>
            <p className="text-xs text-white/80 leading-snug">
              Persona <strong>{tipoCliente === "juridica" ? "jurídica" : "natural"}</strong>
              {aplicarISR ? " con ISR" : " sin ISR"}:{" "}
              <strong>IVA 19%</strong> − <strong>Retefuente {tipoCliente === "juridica" ? "4%" : "10%"}</strong>
              {aplicarISR ? " + ISR 10%" : ""}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
