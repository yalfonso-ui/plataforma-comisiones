// ============================================================
// Validación cruzada de archivos XML / PDF
// Parsea el XML para extraer UUID/Folio y lo cruza con el PDF
// ============================================================

export interface ValidationResult {
  ok: boolean;
  code?: string;
  message?: string;
  data?: { uuid?: string; folio?: string };
}

/**
 * Valida que XML y PDF correspondan al mismo comprobante.
 *
 * Estrategia:
 * 1. Parsear XML con DOMParser
 * 2. Extraer UUID (CFDI 4.0 TimbreFiscalDigital) o Folio
 * 3. Comparar nombre base de ambos archivos
 * 4. Si no coinciden → FOLIO_MISMATCH (error bloqueante)
 */
export async function validarArchivos(
  xml: File,
  pdf: File,
): Promise<ValidationResult> {
  try {
    const xmlText = await xml.text();
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");

    // Verificar que el parseo no haya fallado
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return {
        ok: false,
        code: "XML_INVALID",
        message: "El archivo XML no tiene un formato válido. Verifica que sea un comprobante fiscal.",
      };
    }

    // Extraer UUID — CFDI 4.0: <cfdi:Complemento><tfd:TimbreFiscalDigital UUID="..."/>
    const uuid =
      doc.querySelector("TimbreFiscalDigital")?.getAttribute("UUID") ??
      doc.querySelector("[UUID]")?.getAttribute("UUID") ??
      undefined;

    // Extraer Folio — <cfdi:Comprobante Folio="..."/>
    const folio =
      doc.querySelector("Comprobante")?.getAttribute("Folio") ??
      doc.querySelector("[Folio]")?.getAttribute("Folio") ??
      undefined;

    // Nombre base de cada archivo (sin extensión)
    const xmlBase = xml.name.replace(/\.xml$/i, "").trim();
    const pdfBase = pdf.name.replace(/\.pdf$/i, "").trim();

    // Cruzar: el nombre del PDF debe contener el folio o UUID del XML
    const matchFolio = folio ? pdfBase.includes(folio) : false;
    const matchUuid = uuid ? pdfBase.includes(uuid.slice(0, 8)) : false;
    const matchBase = xmlBase === pdfBase;

    if (!matchFolio && !matchUuid && !matchBase) {
      return {
        ok: false,
        code: "FOLIO_MISMATCH",
        message: `Los archivos no corresponden al mismo comprobante. El PDF "${pdf.name}" no coincide con el folio del XML${folio ? ` (${folio})` : ""}.`,
      };
    }

    return {
      ok: true,
      data: { uuid, folio },
    };
  } catch {
    return {
      ok: false,
      code: "XML_PARSE_ERROR",
      message: "No se pudo leer el archivo XML. Verifica que no esté corrupto.",
    };
  }
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
