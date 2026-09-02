// ============================================================
// Validación cruzada de archivos XML / PDF
// Parsea el XML para extraer UUID/Folio y lo cruza con el PDF.
//
// Estrategia dual según entorno:
//  - Modo DEMO (Vite dev o VITE_DEMO_MODE=true):
//    Acepta cualquier XML/PDF con estructura parseable.
//    El folio/UUID se extrae si existe; si no, se omite la comparación.
//  - Modo PRODUCCIÓN:
//    Validación estricta: folio o UUID debe coincidir entre XML y PDF,
//    o los nombres base deben ser idénticos.
// ============================================================

export interface ValidationResult {
  ok: boolean;
  code?: string;
  message?: string;
  data?: { uuid?: string; folio?: string };
  /** Indica si la validación pasó por el modo flexible (solo demo). */
  relaxed?: boolean;
}

/**
 * Modo demo: en desarrollo o cuando se establece VITE_DEMO_MODE=true,
 * la validación cruzada folio/UUID se vuelve opcional. Esto permite
 * probar el flujo con archivos locales sin exigir un UUID del SAT.
 *
 * En producción, la validación es estricta.
 */
function isDemoMode(): boolean {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.DEV) return true;
    if (import.meta.env.VITE_DEMO_MODE === "true") return true;
  }
  return false;
}

/**
 * Valida que XML y PDF correspondan al mismo comprobante.
 *
 * 1. Parsea XML con DOMParser.
 * 2. Extrae UUID (CFDI 4.0 TimbreFiscalDigital) o Folio si existen.
 * 3. Compara nombre base de ambos archivos.
 * 4. Si no hay coincidencia:
 *    - Modo DEMO: pasa con `relaxed: true` y advertencia en el message.
 *    - Modo PRODUCCIÓN: bloquea con FOLIO_MISMATCH.
 */
export async function validarArchivos(
  xml: File,
  pdf: File,
): Promise<ValidationResult> {
  // Validación estructural del XML — siempre bloquea si no parsea.
  let xmlText: string;
  try {
    xmlText = await xml.text();
  } catch {
    return {
      ok: false,
      code: "XML_PARSE_ERROR",
      message: "No se pudo leer el archivo XML. Verifica que no esté corrupto.",
    };
  }

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlText, "application/xml");
  } catch {
    return {
      ok: false,
      code: "XML_PARSE_ERROR",
      message: "No se pudo parsear el XML.",
    };
  }

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    return {
      ok: false,
      code: "XML_INVALID",
      message: "El archivo XML no tiene un formato válido. Verifica que sea un comprobante fiscal.",
    };
  }

  // Extraer UUID y Folio (pueden no existir en modo demo).
  const uuid =
    doc.querySelector("TimbreFiscalDigital")?.getAttribute("UUID") ??
    doc.querySelector("[UUID]")?.getAttribute("UUID") ??
    undefined;
  const folio =
    doc.querySelector("Comprobante")?.getAttribute("Folio") ??
    doc.querySelector("[Folio]")?.getAttribute("Folio") ??
    undefined;

  // Nombres base.
  const xmlBase = xml.name.replace(/\.xml$/i, "").trim();
  const pdfBase = pdf.name.replace(/\.pdf$/i, "").trim();

  const matchFolio = folio ? pdfBase.includes(folio) : false;
  const matchUuid = uuid ? pdfBase.includes(uuid.slice(0, 8)) : false;
  const matchBase = xmlBase === pdfBase;

  if (matchFolio || matchUuid || matchBase) {
    return { ok: true, data: { uuid, folio } };
  }

  // Sin coincidencia → ¿estamos en modo demo?
  if (isDemoMode()) {
    return {
      ok: true,
      relaxed: true,
      data: { uuid, folio },
      message:
        folio || uuid
          ? `Modo demo: los archivos no comparten folio/UUID pero el XML parseó correctamente. Se aceptó para continuar la prueba.`
          : "Modo demo: el XML no tiene folio/UUID pero parseó correctamente. Se aceptó para continuar la prueba.",
    };
  }

  return {
    ok: false,
    code: "FOLIO_MISMATCH",
    message: `Los archivos no corresponden al mismo comprobante. El PDF "${pdf.name}" no coincide con el folio del XML${folio ? ` (${folio})` : ""}.`,
  };
}

/**
 * Lee un File y lo convierte a base64 (data URL completo).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
