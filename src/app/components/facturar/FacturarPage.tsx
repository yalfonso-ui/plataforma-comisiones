// ============================================================
// Orquestador del wizard de facturación
// Conecta todos los steps + panel lateral + navegación
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "../../store/appStore";
import { useDateFilterStore, getDateRange } from "../../store/dateFilterStore";
import { DateFilter } from "../DateFilter";
import { useFacturarWizard } from "./useFacturarWizard";

import { WizardHeader } from "./WizardHeader";
import { WizardFooter } from "./WizardFooter";
import { ResumenFacturacion } from "./ResumenFacturacion";
import { StepSeleccionOperaciones } from "./StepSeleccionOperaciones";
import { StepClienteImpuestos } from "./StepClienteImpuestos";
import { StepArchivos } from "./StepArchivos";
import { StepConfirmacion } from "./StepConfirmacion";
import { useScrollHighlight } from "../../hooks/useScrollHighlight";

import { BORDER_DEFAULT, TEXT_SECONDARY } from "../../utils/ui";
import type { TipoCliente } from "../../types/domain";

export function FacturarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialVoucher = searchParams.get("voucher") ?? undefined;

  const operations = useAppStore((s) => s.operations);
  const addInvoice = useAppStore((s) => s.addInvoice);
  const { period, customStartDate, customEndDate } = useDateFilterStore();

  const wizard = useFacturarWizard(initialVoucher);
  const { scrollTo } = useScrollHighlight();

  // ============================================================
  // Preselección al cargar si hay ?voucher=
  // Espera a que `operations` esté disponible (no array vacío inicial)
  // y solo se ejecuta una vez por `initialVoucher`.
  // ============================================================
  useEffect(() => {
    if (operations.length === 0) return;
    if (!initialVoucher) return;
    wizard.preselectFromUrl(operations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations.length, initialVoucher]);

  // ============================================================
  // GUÍA AUTOMÁTICA — Al entrar al paso 2 sin tipo cliente,
  // hacemos scroll a la sección crítica y disparamos el pulse.
  // Esto evita que el usuario tenga que buscar dónde está el bloqueo.
  // ============================================================
  useEffect(() => {
    // Solo dispara cuando: paso 2 + sin tipo cliente + hay operaciones
    if (wizard.step !== 2) return;
    if (wizard.tipoCliente !== null) return;
    if (wizard.selectedOps.length === 0) return;

    // Pequeño delay para que el step termine de transicionar
    const t = setTimeout(() => {
      scrollTo("step2-tipo-cliente");
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.step]);

  // ============================================================
  // Operaciones disponibles (filtradas por fecha)
  // ============================================================
  const dateRange = getDateRange(period, customStartDate, customEndDate);
  const availableOps = operations.filter(op => {
    const matchesStatus = op.status === "disponible";
    const opDate = new Date(op.fecha);
    return matchesStatus && opDate >= dateRange.startDate && opDate <= dateRange.endDate;
  });

  // ============================================================
  // Mensajes-guía por paso
  // ============================================================
  // Mensajes-guía unificados por paso. Estos textos son la "fuente única
  // de verdad" para lo que el usuario debe hacer, y se replican
  // tanto en el footer (pill de hint) como en el panel lateral (stepHint).
  // Si cambias uno, mantenlos sincronizados en ambos lugares.
  const hints: Record<1 | 2 | 3 | 4, string> = {
    1: "Selecciona al menos una operación",
    2: "Selecciona el tipo de cliente",
    3: "Sube ambos archivos y verifica la validación cruzada",
    4: "Revisa el resumen y haz clic en Radicar Factura",
  };

  // ============================================================
  // Acción principal: Radicar Factura
  // ============================================================
  const handleRadicar = async () => {
    if (!wizard.canRadicar) return;
    const result = await wizard.buildInvoice();
    if (!result) {
      toast.error("No se pudo radicar la factura", {
        description: "Faltan datos por completar. Verifica los pasos anteriores.",
      });
      return;
    }
    addInvoice(result.invoice);
    toast.success("¡Factura radicada!", {
      description: `ID: ${result.invoice.id} — Pasó a revisión de Cartera. Recibirás una notificación cuando sea aprobada.`,
      action: {
        label: "Ver Historial",
        onClick: () => navigate("/historial"),
      },
    });
  };

  // ============================================================
  // Success screen
  // ============================================================
  if (wizard.submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 bg-success-soft rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-azul-oscuro">¡Factura enviada correctamente!</h2>
          <p className={TEXT_SECONDARY}>
            Tu factura ha sido radicada en el sistema y se enviará al equipo de Cartera para aprobación.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/historial")}
            className={`px-6 py-3 border ${BORDER_DEFAULT} ${TEXT_SECONDARY} rounded-lg hover:bg-canvas transition-colors font-medium`}
          >
            Ver Historial
          </button>
          <button
            onClick={() => wizard.reset()}
            className="px-6 py-3 bg-azul-oscuro text-white rounded-lg hover:bg-azul-oscuro-hover transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva factura
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Empty state — sin ops disponibles
  // ============================================================
  if (availableOps.length === 0) {
    return (
      <div className="space-y-6">
        <DateFilter />
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="w-20 h-20 bg-canvas rounded-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-text-secondary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-azul-oscuro">No hay operaciones disponibles</h2>
            <p className={TEXT_SECONDARY}>
              Confirma pagos en la sección de Cartera para poder facturar.
            </p>
          </div>
          <button
            onClick={() => navigate("/cartera")}
            className="px-6 py-3 bg-amarillo text-azul-oscuro rounded-lg hover:bg-amarillo-hover transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azul-oscuro focus-visible:ring-offset-2"
          >
            Ir a Cartera
          </button>
        </div>
      </div>
    );
  }

  return (
    // pb-32 = 128px. Espacio inferior para que el footer fijo no tape
    // el último registro de la tabla cuando el usuario hace scroll al final.
    <div className="space-y-4 pb-32">
      {/* Stepper — sticky en móvil para mantener el contexto siempre visible */}
      <div className="sticky top-16 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static bg-canvas sm:bg-transparent py-1">
        <WizardHeader
          currentStep={wizard.step}
          canGoToStep1={true}
          canGoToStep2={wizard.canAdvanceFromStep1}
          canGoToStep3={wizard.canAdvanceFromStep1 && wizard.canAdvanceFromStep2}
          canGoToStep4={wizard.canAdvanceFromStep1 && wizard.canAdvanceFromStep2 && wizard.canAdvanceFromStep3}
        onStepClick={(s) => {
          if (s === 1) wizard.goTo(1);
          else if (s === 2 && wizard.canAdvanceFromStep1) wizard.goTo(2);
          else if (s === 3 && wizard.canAdvanceFromStep1 && wizard.canAdvanceFromStep2) wizard.goTo(3);
          else if (s === 4 && wizard.canAdvanceFromStep1 && wizard.canAdvanceFromStep2 && wizard.canAdvanceFromStep3) wizard.goTo(4);
        }}
        />
      </div>

      {/* =================================================================
         GRID PRINCIPAL CON SCROLL GLOBAL DE PÁGINA

         Arquitectura final (post-fixes):
         - La página entera scrollea de forma natural (window scroll).
         - La tabla de la izquierda crece todo lo que necesite — sin
           max-h ni overflow interno.
         - El panel lateral usa `sticky top-24` para quedar anclado al
           top del viewport durante el scroll.
         - `items-start` evita que el grid estire el panel al alto del
           contenido de la izquierda.
         - `self-start` en la columna derecha (CSS Grid align-self: start)
           es CRÍTICO para que `position: sticky` funcione.
         - El WizardFooter queda como hermano del grid (afuera), flotando
           en el bottom con bg translúcido (peso visual mínimo).
         ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* COLUMNA IZQUIERDA — contenido del step, scrollea con la página */}
        <div className="lg:col-span-2 space-y-4">
          {wizard.step === 1 && (
            <StepSeleccionOperaciones
              operations={operations}
              selectedIds={wizard.selectedOpIds}
              onToggle={(id) => wizard.toggleOp(id, availableOps)}
              onToggleAll={(checked) => wizard.toggleAll(checked, availableOps)}
            />
          )}

          {wizard.step === 2 && (
            <StepClienteImpuestos
              tipoCliente={wizard.tipoCliente}
              aplicarISR={wizard.aplicarISR}
              onTipoChange={(t: TipoCliente) => wizard.setTipoCliente(t)}
              onISRChange={(v) => wizard.setAplicarISR(v)}
              highlightRequired={!wizard.tipoCliente}
            />
          )}

          {wizard.step === 3 && (
            <StepArchivos
              xmlFile={wizard.xmlFile}
              pdfFile={wizard.pdfFile}
              validation={wizard.validation}
              validationStatus={wizard.validationStatus}
              onXmlChange={wizard.setXmlFile}
              onPdfChange={wizard.setPdfFile}
            />
          )}

          {wizard.step === 4 && (
            <StepConfirmacion
              selectedOps={wizard.selectedOps}
              fiscal={wizard.fiscal}
              tipoClienteLabel={
                wizard.tipoCliente === "natural" ? "Persona Natural" :
                wizard.tipoCliente === "juridica" ? "Persona Jurídica" : "—"
              }
              xmlFile={wizard.xmlFile}
              pdfFile={wizard.pdfFile}
            />
          )}
        </div>

        {/* COLUMNA DERECHA — Resumen con sticky top-24 (paralelo a la tabla).
            `self-start` es CRÍTICO: sin esto, CSS Grid estira la celda al
            alto del hermano (`align-items: stretch` por defecto) y el
            sticky queda anulado. */}
        <div className="lg:col-span-1 self-start">
          <ResumenFacturacion
            fiscal={wizard.fiscal}
            tipoCliente={wizard.tipoCliente}
            selectedCount={wizard.selectedOps.length}
            selectedOps={wizard.selectedOps}
            currentStep={wizard.step}
            onJumpTo={scrollTo}
          />
        </div>
      </div>

      {/* Footer fuera del grid, hermano del grid y del stepper.
          Vive en position: fixed con bg translúcido. No interfiere con
          el sticky porque es un nodo independiente. */}
      <WizardFooter
        step={wizard.step}
        canBack={wizard.step > 1}
        canNext={
          (wizard.step === 1 && wizard.canAdvanceFromStep1) ||
          (wizard.step === 2 && wizard.canAdvanceFromStep2) ||
          (wizard.step === 3 && wizard.canAdvanceFromStep3)
        }
        canRadicar={wizard.canRadicar}
        isSubmitting={wizard.isSubmitting}
        nextHint={
          (wizard.step === 1 && !wizard.canAdvanceFromStep1) ||
          (wizard.step === 2 && !wizard.canAdvanceFromStep2) ||
          (wizard.step === 3 && !wizard.canAdvanceFromStep3)
            ? hints[wizard.step]
            : undefined
        }
        nextHintBlocking={wizard.step === 2 && !wizard.tipoCliente}
        onHintClick={
          wizard.step === 2 && !wizard.tipoCliente
            ? () => scrollTo("step2-tipo-cliente")
            : undefined
        }
        radicarHint={!wizard.canRadicar ? hints[4] : undefined}
        onBack={wizard.back}
        onNext={wizard.next}
        onRadicar={handleRadicar}
      />
    </div>
  );
}
