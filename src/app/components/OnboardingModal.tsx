import { useEffect, useState } from "react";
import { Clock, Hourglass, CheckCircle2, FileText, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { useAppStore } from "../store/appStore";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  BG_CANVAS,
  PENDIENTE_CLASS,
  PENDIENTE_RECAUDO_CLASS,
  CONFIRMADO_CLASS,
  DISPONIBLE_CLASS,
} from "../utils/ui";

const SLIDES = [
  {
    title: "¡Bienvenido a Continental Comisiones!",
    description: "Gestiona tus comisiones y facturación desde un único lugar. Te mostraremos el flujo unificado en 4 pasos.",
    icon: Sparkles,
    color: "from-[#00184C] to-[#002a6e]",
  },
  {
    title: "1. Mis vouchers y facturación guiada",
    description: "Consulta todas las comisiones generadas. Cada voucher pasa por 4 estados: pendiente → confirmado → disponible. Cuando esté disponible, inicias la facturación con un clic.",
    icon: FileText,
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "2. Wizard de facturación en 4 pasos",
    description: "1) Selecciona operaciones. 2) Elige tipo de cliente (Jurídica o Natural con ISR). 3) Sube XML y PDF — el sistema valida que correspondan al mismo comprobante. 4) Confirma y envía.",
    icon: Clock,
    color: "from-orange-400 to-rose-500",
    states: true,
  },
  {
    title: "3. Aprobación y dispersión",
    description: "Tu factura pasa por Cartera (aprobación inicial) y luego por Comisiones (validación fiscal y dispersión). El módulo de Comisiones genera el archivo plano ACH con tus datos bancarios.",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "4. Historial y trazabilidad",
    description: "Sigue el estado de cada factura en /historial. Verás el desglose fiscal completo, podrás descargar XML/PDF y filtrar por fecha o estado.",
    icon: CheckCircle2,
    color: "from-blue-500 to-cyan-500",
  },
];

export function OnboardingModal() {
  const [step, setStep] = useState(0);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);

  const open = !onboardingCompleted;

  // A11y: Escape cierra el tutorial (equivale a "Saltar").
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        completeOnboarding();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, completeOnboarding]);

  if (!open) return null;

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;
  const isFirst = step === 0;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => completeOnboarding();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial de bienvenida"
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in">
        {/* Header con color */}
        <div className={`bg-gradient-to-r ${slide.color} text-white p-8 relative`}>
          <button
            onClick={handleSkip}
            aria-label="Saltar tutorial"
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs uppercase tracking-wider font-semibold">
                Paso {step + 1} de {SLIDES.length}
              </p>
              <h2 className="text-2xl font-bold mt-1">{slide.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          <p className="text-azul-oscuro/80 leading-relaxed">{slide.description}</p>

          {slide.states && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StateCard
                icon={Clock}
                className={PENDIENTE_CLASS}
                title="Pendiente"
                description="Acción: subir comprobante"
              />
              <StateCard
                icon={Hourglass}
                className={PENDIENTE_RECAUDO_CLASS}
                title="Pendiente de recaudo"
                description="En proceso — sin acción del comercial"
              />
              <StateCard
                icon={CheckCircle2}
                className={CONFIRMADO_CLASS}
                title="Pago confirmado"
                description="Recaudo verificado por la empresa"
              />
              <StateCard
                icon={CheckCircle2}
                className={DISPONIBLE_CLASS}
                title="Disponible"
                description="Listo para facturar"
              />
            </div>
          )}

          {/* Progress */}
          <div className="flex justify-center gap-2" aria-hidden="true">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Ir al paso ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-azul-oscuro"
                    : `w-2 ${BG_CANVAS} hover:bg-text-secondary/40`
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={`p-6 border-t ${BORDER_DEFAULT} flex items-center justify-between bg-canvas`}>
          <button
            onClick={resetOnboarding}
            className={`text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}
          >
            Replay tour
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className={`px-4 py-2 text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}
            >
              Saltar
            </button>
            {!isFirst && (
              <button
                onClick={() => setStep(step - 1)}
                className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              className={`${BTN_PRIMARY} px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-1`}
            >
              {isLast ? "Comenzar" : "Siguiente"}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StateCard({ icon: Icon, className, title, description }: {
  icon: typeof Clock;
  className: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`p-3 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs opacity-80">{description}</p>
    </div>
  );
}
