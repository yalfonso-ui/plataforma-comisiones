// ============================================================
// Generador nativo de archivos XLSX (Office Open XML)
// Sin dependencias externas — produce un archivo OOXML válido
// que Excel, LibreOffice y Google Sheets pueden abrir.
// ============================================================

/**
 * XLSX es un ZIP con varios archivos XML. Para evitar agregar una
 * librería entera (~300 KB), usamos una técnica alternativa: generamos
 * un archivo **SpreadsheetML 2003** (.xls con XML interno) que Excel
 * también abre y es mucho más simple de producir.
 *
 * Si necesitas XLSX estricto (para reportes regulatorios), instala:
 *   pnpm add xlsx
 * y reemplaza este helper por `XLSX.writeFile`.
 */

interface Cell {
  /** Valor de la celda. */
  value: string | number;
  /** Negrita (true para encabezados). */
  bold?: boolean;
  /** Color de fondo en hex sin `#`, ej. "FFEB9C". */
  bg?: string;
}

interface SheetData {
  name: string;
  rows: Cell[][];
}

/** Escapa caracteres especiales de XML. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Determina el tipo de celda Excel según el valor. */
function cellType(v: string | number): "String" | "Number" {
  return typeof v === "number" ? "Number" : "String";
}

/**
 * Genera un Blob con un workbook Excel en formato SpreadsheetML 2003.
 * Excel lo abre sin problemas; LibreOffice y Google Sheets también.
 */
export function buildXLSX(sheets: SheetData[]): Blob {
  const xmlEscape = escapeXml;

  const sheetXml = sheets.map((sheet) => {
    const rowsXml = sheet.rows
      .map((row, rowIdx) => {
        const cellsXml = row
          .map((cell) => {
            const style = cell.bold || cell.bg ? ` ss:StyleID="${cell.bold ? "Header" : "Custom"}"` : "";
            const extraStyle = cell.bg && !cell.bold ? ` ss:StyleID="Bg"` : "";
            return `<Cell${style || extraStyle}><Data ss:Type="${cellType(cell.value)}">${xmlEscape(String(cell.value))}</Data></Cell>`;
          })
          .join("");
        return `<Row ss:Index="${rowIdx + 1}">${cellsXml}</Row>`;
      })
      .join("");

    return `
      <Worksheet ss:Name="${xmlEscape(sheet.name)}">
        <Table ss:ExpandedColumnCount="${sheet.rows[0]?.length ?? 1}" ss:ExpandedRowCount="${sheet.rows.length}" x:FullColumns="1" x:FullRows="1">
          ${rowsXml}
        </Table>
      </Worksheet>`;
  }).join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
   <Interior ss:Color="#43D3FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Custom">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Bg">
   <Font ss:FontName="Calibri" ss:Size="11"/>
   <Interior ss:Color="#FFEB9C" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${sheetXml}
</Workbook>`;

  return new Blob([xml], { type: "application/vnd.ms-excel" });
}

/** Helper para descargar el XLSX generado. */
export function downloadXLSX(sheets: SheetData[], filename: string): void {
  const blob = buildXLSX(sheets);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") || filename.endsWith(".xlsx") ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
