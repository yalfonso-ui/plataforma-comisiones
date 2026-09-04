// ============================================================
// PASO 3 — Subida de archivos XML y PDF con validación cruzada
// ============================================================

import { useState } from "react";
import { CheckCircle2, AlertCircle, FileText, ShieldCheck, Upload } from "lucide-react";
import type { ValidationResult } from "../../utils/fileValidation";
import { BORDER_DEFAULT, TEXT_SECONDARY, alertBg, alertIcon, alertText } from "../../utils/ui";
import { FileUploadBox } from "./FileUploadBox";

interface StepArchivosProps {
  xmlFile: File | null;
  pdfFile: File | null;
  validation: ValidationResult | null;
  validationStatus: { xml?: string; pdf?: string; cross?: string };
  onXmlChange: (file: File | null) => void;
  onPdfChange: (file: File | null) => void;
}

export function StepArchivos({
  xmlFile,
  pdfFile,
  validation,
  validationStatus,
  onXmlChange,
  onPdfChange,
}: StepArchivosProps) {
  const [isValidating, setIsValidating] = useState(false);

  // Mostrar validación como pendiente si ambos archivos están y no hay resultado
  const showPending = xmlFile && pdfFile && !validation && !validationStatus.cross && !isValidating;

  const isValid = !!validation?.ok;
  const hasError = !!validationStatus.cross || !!validationStatus.xml || !!validationStatus.pdf;

  return (
    <div className="space-y-4">
      {/* Empty state explícito: si falta al menos un archivo */}
      {!xmlFile && !pdfFile && (
        <div
          id="step3-xml-upload"
          className={`bg-warning-soft border-2 border-dashed border-warning-border/40 rounded-xl p-8 text-center`}
        >
          <Upload className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-azul-oscuro font-semibold mb-1">Sube ambos archivos para continuar</p>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Arrastra o haz clic en cada cuadro de abajo. Verificaremos que el XML y el PDF
            correspondan al mismo comprobante.
          </p>
        </div>
      )}

      {/* Zona de upload */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-5`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="step3-xml-upload-cell">
            <FileUploadBox
              label="Archivo XML"
              accept=".xml"
              file={xmlFile}
              onFileChange={onXmlChange}
              error={validationStatus.xml}
            />
          </div>
          <FileUploadBox
            label="Archivo PDF"
            accept=".pdf"
            file={pdfFile}
            onFileChange={onPdfChange}
            error={validationStatus.pdf}
          />
        </div>
      </div>

      {/* Resultado de validación */}
      {showPending && (
        <div className={`${alertBg.info} rounded-xl p-4 flex items-start gap-3`}>
          <FileText className={`w-5 h-5 ${alertIcon.info} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm ${alertText.info}`}>
            Validando que ambos archivos correspondan al mismo comprobante...
          </p>
        </div>
      )}

      {isValid && validation?.data && (
        <div className={`${alertBg.success} rounded-xl p-4 flex items-start gap-3`}>
          <CheckCircle2 className={`w-5 h-5 ${alertIcon.success} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${alertText.success}`}>
              {validation.relaxed
                ? "Archivos aceptados en modo demo"
                : "Archivos validados correctamente"}
            </p>
            <p className={`text-xs ${alertText.success} opacity-80 mt-1`}>
              {validation.data.folio && <>Folio: <span className="font-mono">{validation.data.folio}</span></>}
              {validation.data.uuid && <> · UUID: <span className="font-mono">{validation.data.uuid.slice(0, 13)}...</span></>}
            </p>
            {validation.relaxed && (
              <p className={`text-xs ${alertText.success} opacity-80 mt-1 italic`}>
                ⚠️ Modo demo: la validación cruzada folio/UUID se omitió. En producción se exigiría coincidencia estricta.
              </p>
            )}
            <p className={`text-xs ${alertText.success} opacity-80 mt-1`}>
              Puedes continuar al paso 4.
            </p>
          </div>
          <ShieldCheck className={`w-5 h-5 ${alertIcon.success}`} />
        </div>
      )}

      {hasError && validationStatus.cross && (
        <div className={`${alertBg.danger} rounded-xl p-4 flex items-start gap-3 border-2`}>
          <AlertCircle className={`w-5 h-5 ${alertIcon.danger} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${alertText.danger}`}>
              No se puede continuar — archivos no coinciden
            </p>
            <p className={`text-xs ${alertText.danger} mt-1`}>
              {validationStatus.cross}
            </p>
            <p className={`text-xs ${alertText.danger} opacity-80 mt-2`}>
              <strong>Acción:</strong> Corrige el archivo que no coincida y vuelve a subirlo.
              La factura no se puede radicar hasta que ambos archivos estén validados.
            </p>
          </div>
        </div>
      )}

      {/* Guía */}
      <div className="bg-canvas border border-border-base rounded-xl p-4">
        <p className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-azul-oscuro">Tip:</strong> El XML debe contener el folio del
          comprobante y el PDF debe tener un nombre que lo incluya (o ser idéntico al XML).
          Esto garantiza que el comprobante fiscal es válido y trazable.
        </p>
      </div>
    </div>
  );
}
