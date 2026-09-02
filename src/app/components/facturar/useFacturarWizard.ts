// ============================================================
// Hook de estado del wizard de facturación
// Concentra toda la lógica del flujo: selección, fiscal, archivos
// ============================================================

import { useEffect, useState } from "react";
import type { Operation } from "../../store/appStore";
import { calcularFiscal } from "../../utils/fiscal";
import { validarArchivos, fileToBase64, type ValidationResult } from "../../utils/fileValidation";
import type { FiscalSnapshot, FileAttachment, TipoCliente, InvoiceStatus } from "../../types/domain";

export type WizardStep = 1 | 2 | 3 | 4;

export interface ValidationStatus {
  xml?: string;
  pdf?: string;
  cross?: string;
}

export function useFacturarWizard(initialVoucher?: string) {
  // ============================================================
  // Estado de selección
  // ============================================================
  const [selectedOpIds, setSelectedOpIds] = useState<Set<string>>(new Set());
  const [selectedOps, setSelectedOps] = useState<Operation[]>([]);
  const [step, setStep] = useState<WizardStep>(1);

  // ============================================================
  // Estado del paso 2 — cliente e impuestos
  // ============================================================
  const [tipoCliente, setTipoCliente] = useState<TipoCliente | null>(null);
  const [aplicarISR, setAplicarISR] = useState(false);

  // ============================================================
  // Estado del paso 3 — archivos
  // ============================================================
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({});

  // ============================================================
  // Estado del paso 4 — submission
  // ============================================================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ============================================================
  // Cálculo fiscal en vivo
  // ============================================================
  const fiscal: FiscalSnapshot | null = (() => {
    if (selectedOpIds.size === 0 || !tipoCliente) return null;
    const comisionBruta = selectedOps.reduce((s, o) => s + (o.comision ?? 0), 0);
    const baseGravable = selectedOps.reduce((s, o) => s + (o.base ?? 0), 0);
    return calcularFiscal({
      comisionBruta,
      baseGravable,
      tipoCliente,
      aplicarISR,
    });
  })();

  // ============================================================
  // Handlers de selección
  // ============================================================
  const toggleOp = (id: string, operations: Operation[]) => {
    setSelectedOpIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const ops = operations.filter(o => next.has(o.id));
      setSelectedOps(ops);
      return next;
    });
  };

  const toggleAll = (checked: boolean, operations: Operation[]) => {
    if (checked) {
      const all = new Set(operations.map(o => o.id));
      setSelectedOpIds(all);
      setSelectedOps(operations);
    } else {
      setSelectedOpIds(new Set());
      setSelectedOps([]);
    }
  };

  // ============================================================
  // Validación cruzada XML/PDF automática
  // ============================================================
  useEffect(() => {
    if (!xmlFile || !pdfFile) {
      setValidation(null);
      setValidationStatus({});
      return;
    }

    let cancelled = false;
    (async () => {
      const newStatus: ValidationStatus = {};
      if (xmlFile.size > 10 * 1024 * 1024) newStatus.xml = "XML supera 10 MB";
      if (pdfFile.size > 10 * 1024 * 1024) newStatus.pdf = "PDF supera 10 MB";

      const result = await validarArchivos(xmlFile, pdfFile);
      if (cancelled) return;
      setValidation(result);
      if (!result.ok) newStatus.cross = result.message;
      setValidationStatus(newStatus);
    })();

    return () => { cancelled = true; };
  }, [xmlFile, pdfFile]);

  // ============================================================
  // Validaciones por paso
  // ============================================================
  const canAdvanceFromStep1 = selectedOpIds.size > 0;
  const canAdvanceFromStep2 = tipoCliente !== null;
  const canAdvanceFromStep3 =
    xmlFile !== null &&
    pdfFile !== null &&
    !!validation?.ok &&
    !validationStatus.xml &&
    !validationStatus.pdf &&
    !validationStatus.cross;

  const canRadicar =
    canAdvanceFromStep1 &&
    canAdvanceFromStep2 &&
    canAdvanceFromStep3 &&
    fiscal !== null;

  // ============================================================
  // Navegación
  // ============================================================
  const next = () => setStep(prev => Math.min(4, prev + 1) as WizardStep);
  const back = () => setStep(prev => Math.max(1, prev - 1) as WizardStep);
  const goTo = (s: WizardStep) => setStep(s);

  // ============================================================
  // Reset
  // ============================================================
  const reset = () => {
    setSelectedOpIds(new Set());
    setSelectedOps([]);
    setStep(1);
    setTipoCliente(null);
    setAplicarISR(false);
    setXmlFile(null);
    setPdfFile(null);
    setValidation(null);
    setValidationStatus({});
    setSubmitted(false);
    setIsSubmitting(false);
  };

  // ============================================================
  // Preselección desde query param
  // ============================================================
  const preselectFromUrl = (operations: Operation[]) => {
    if (!initialVoucher) return;
    const op = operations.find(o => o.voucher === initialVoucher);
    if (op && op.status === "disponible") {
      setSelectedOpIds(new Set([op.id]));
      setSelectedOps([op]);
    }
  };

  // ============================================================
  // Construcción del invoice final
  // ============================================================
  const buildInvoice = async () => {
    if (!fiscal || !xmlFile || !pdfFile || !validation?.data) return null;

    setIsSubmitting(true);
    try {
      const xmlBase64 = await fileToBase64(xmlFile);
      const pdfBase64 = await fileToBase64(pdfFile);

      const xmlAttachment: FileAttachment = {
        name: xmlFile.name,
        size: xmlFile.size,
        base64: xmlBase64,
        uuid: validation.data.uuid,
        folio: validation.data.folio,
      };

      const pdfAttachment: FileAttachment = {
        name: pdfFile.name,
        size: pdfFile.size,
        base64: pdfBase64,
      };

      const invoice: import("../../store/appStore").Invoice = {
        id: `INV-${Date.now()}`,
        fecha: new Date().toISOString().split("T")[0],
        vouchers: selectedOps.map(o => o.voucher),
        totalComision: fiscal.totalComision,
        totalLiquidado: fiscal.baseGravable,
        xmlFileName: xmlFile.name,
        pdfFileName: pdfFile.name,
        status: "en_cartera" as InvoiceStatus,
        rfc: "GARM850312AB1",
        razonSocial: "María García López",
        folioFiscal: validation.data.uuid ?? validation.data.folio,
        agenciaId: selectedOps[0]?.agenciaId,
        fiscal,
        xmlFile: xmlAttachment,
        pdfFile: pdfAttachment,
        archivosValidados: true,
      };

      setSubmitted(true);
      return invoice;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    selectedOps,
    selectedOpIds,
    tipoCliente,
    aplicarISR,
    xmlFile,
    pdfFile,
    validation,
    validationStatus,
    fiscal,
    isSubmitting,
    submitted,

    setTipoCliente,
    setAplicarISR,
    setXmlFile,
    setPdfFile,

    toggleOp,
    toggleAll,
    next,
    back,
    goTo,
    reset,
    preselectFromUrl,
    buildInvoice,

    canAdvanceFromStep1,
    canAdvanceFromStep2,
    canAdvanceFromStep3,
    canRadicar,
  };
}

export type FacturarWizard = ReturnType<typeof useFacturarWizard>;
