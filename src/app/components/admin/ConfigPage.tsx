// ============================================================
// Módulo Configuración — Ajustes globales del sistema
// Tasas fiscales, datos del emisor, parámetros operativos.
// Solo accesible para super_admin.
// ============================================================

import { useState, useEffect } from "react";
import { Save, Settings, Building2, Calculator, Info, AlertCircle } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { toast } from "sonner";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  alertBg,
  alertIcon,
  alertText,
} from "../../utils/ui";

export function ConfigPage() {
  const config = useAppStore((s) => s.config);
  const updateConfig = useAppStore((s) => s.updateConfig);

  const [form, setForm] = useState(config);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(config);
    setDirty(false);
  }, [config]);

  const handleChange = <K extends keyof typeof config>(key: K, value: (typeof config)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    if (form.ivaColombia < 0 || form.ivaColombia > 1) {
      toast.error("La tasa de IVA debe estar entre 0 y 1 (ej: 0.19 = 19%)");
      return;
    }
    if (form.tasaRetefuenteJuridica < 0 || form.tasaRetefuenteJuridica > 1) {
      toast.error("La tasa de Retefuente Jurídica debe estar entre 0 y 1");
      return;
    }
    if (form.tasaRetefuenteNatural < 0 || form.tasaRetefuenteNatural > 1) {
      toast.error("La tasa de Retefuente Natural debe estar entre 0 y 1");
      return;
    }
    if (form.tasaReteICA < 0 || form.tasaReteICA > 1) {
      toast.error("La tasa de ReteICA debe estar entre 0 y 1");
      return;
    }
    if (!form.razonSocialEmisor.trim() || !form.nitEmisor.trim()) {
      toast.error("La razón social y NIT del emisor son obligatorios");
      return;
    }
    updateConfig(form);
    setDirty(false);
  };

  const handleRevert = () => {
    setForm(config);
    setDirty(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-azul-oscuro font-semibold mb-1">Configuración General</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Ajustes globales del sistema. Los cambios se aplican al próximo cálculo fiscal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleRevert}
              className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium`}
            >
              Descartar cambios
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty}
            className={`${BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Banner informativo si hay cambios sin guardar */}
      {dirty && (
        <div className={`${alertBg.warning} rounded-xl p-3 flex items-start gap-2`}>
          <AlertCircle className={`w-4 h-4 ${alertIcon.warning} flex-shrink-0 mt-0.5`} />
          <p className={`text-xs ${alertText.warning}`}>
            Tienes cambios sin guardar. Haz clic en "Guardar cambios" para aplicarlos o "Descartar" para volver al estado anterior.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasas fiscales */}
        <section className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-celeste" />
            <h3 className="text-azul-oscuro font-semibold">Tasas Fiscales</h3>
          </div>
          <p className={`text-xs ${TEXT_SECONDARY}`}>
            Tasas en formato decimal: <span className="font-mono">0.19</span> = 19%.
          </p>

          <PercentField
            label="IVA Colombia"
            value={form.ivaColombia}
            onChange={(v) => handleChange("ivaColombia", v)}
            hint="Aplica a todas las facturas con tipo de cliente colombiano."
          />
          <PercentField
            label="Retefuente — Persona Jurídica"
            value={form.tasaRetefuenteJuridica}
            onChange={(v) => handleChange("tasaRetefuenteJuridica", v)}
            hint="Tasa reducida para empresas y sociedades."
          />
          <PercentField
            label="Retefuente — Persona Natural"
            value={form.tasaRetefuenteNatural}
            onChange={(v) => handleChange("tasaRetefuenteNatural", v)}
            hint="Tasa de honorarios para personas naturales."
          />
          <PercentField
            label="ReteICA (opcional)"
            value={form.tasaReteICA}
            onChange={(v) => handleChange("tasaReteICA", v)}
            hint="Impuesto de industria y comercio — solo Bogotá y algunas plazas."
          />
        </section>

        {/* Datos del emisor + parámetros */}
        <div className="space-y-4">
          {/* Datos del emisor */}
          <section className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-5 space-y-3`}>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-celeste" />
              <h3 className="text-azul-oscuro font-semibold">Datos del Emisor</h3>
            </div>
            <Field label="Razón social">
              <input
                type="text"
                value={form.razonSocialEmisor}
                onChange={(e) => handleChange("razonSocialEmisor", e.target.value)}
                className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
              />
            </Field>
            <Field label="NIT / RFC">
              <input
                type="text"
                value={form.nitEmisor}
                onChange={(e) => handleChange("nitEmisor", e.target.value)}
                className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm font-mono"
              />
            </Field>
          </section>

          {/* Parámetros operativos */}
          <section className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-5 space-y-3`}>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-celeste" />
              <h3 className="text-azul-oscuro font-semibold">Parámetros Operativos</h3>
            </div>
            <label className="flex items-start gap-3 cursor-pointer p-3 border border-border-base rounded-lg hover:border-celeste transition-colors">
              <input
                type="checkbox"
                checked={form.aplicarISRPorDefecto}
                onChange={(e) => handleChange("aplicarISRPorDefecto", e.target.checked)}
                className="w-4 h-4 mt-0.5 text-celeste rounded border-border-base focus:ring-celeste accent-celeste"
              />
              <div>
                <p className="text-sm font-medium text-azul-oscuro">Aplicar ISR por defecto</p>
                <p className={`text-xs ${TEXT_SECONDARY} mt-0.5`}>
                  Cuando esté activo, el wizard de facturación marcará el switch de ISR por defecto.
                  El usuario podrá desactivarlo en cada factura.
                </p>
              </div>
            </label>
          </section>

          {/* Información */}
          <div className={`${BG_CANVAS} border ${BORDER_DEFAULT} rounded-xl p-4 flex items-start gap-2`}>
            <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
            <p className={`text-xs ${TEXT_SECONDARY} leading-relaxed`}>
              <strong className="text-azul-oscuro">Importante:</strong> los cambios en tasas fiscales
              no recalcularán facturas ya radicadas. Solo afectan los nuevos cálculos. Si necesitas
              recalcular facturas existentes, contacta al equipo de TI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-azul-oscuro mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function PercentField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-medium text-azul-oscuro mb-1 block">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="1"
            step="0.001"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm font-mono"
          />
          <span className="text-xs text-text-secondary">
            = {(value * 100).toFixed(1)}%
          </span>
        </div>
      </label>
      {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
    </div>
  );
}
