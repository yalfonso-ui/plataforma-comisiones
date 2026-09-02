// ============================================================
// Generador de archivo plano de dispersión de pagos
// Formato colombiano estándar para pagos ACH
// ============================================================

import type { Invoice } from "../store/appStore";

/**
 * Genera un archivo plano (.txt) para dispersión de pagos.
 *
 * Formato:
 *   Header:   H|Fecha|Proveedor|TotalRegistros|TotalMonto
 *   Body:     D|NumeroCuenta|CLABE|TipoIdentificacion|NumeroIdentificacion|Banco|Titular|Monto|Referencia
 *   Footer:   F|TotalRegistros|TotalMonto
 *
 * Cada línea termina con \r\n (estándar Windows / mainframe).
 */
export function generarArchivoDispersion(invoices: Invoice[]): string {
  const fecha = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const lineas: string[] = [];

  // Datos bancarios demo del comercial (en producción saldrían del perfil)
  const bancosDemo = [
    { banco: "BBVA", clabe: "012180001234567890", tipoId: "CC", numId: "79123456" },
    { banco: "Bancolombia", clabe: "023001234567890123", tipoId: "CC", numId: "52987654" },
    { banco: "Davivienda", clabe: "051001234567890123", tipoId: "NIT", numId: "900123456" },
  ];

  const totalMonto = invoices.reduce((s, inv) => s + inv.totalComision, 0);

  // Header
  lineas.push(
    [
      "H",
      fecha,
      "DISPERSION_COMISIONES_CONTINENTAL",
      invoices.length.toString().padStart(6, "0"),
      totalMonto.toFixed(2),
    ].join("|")
  );

  // Body — una línea por factura
  invoices.forEach((inv, idx) => {
    const banco = bancosDemo[idx % bancosDemo.length];
    const titular = inv.razonSocial ?? "COMERCIAL_CONTINENTAL";
    const referencia = `INV-${inv.id.replace("INV-", "")}`;

    lineas.push(
      [
        "D",
        banco.clabe.substring(0, 10),           // numero de cuenta
        banco.clabe,                            // CLABE interbancaria
        banco.tipoId,                           // tipo identificación
        banco.numId,                            // número identificación
        banco.banco,                            // banco
        titular.replace(/[^A-Z0-9 ]/gi, "").toUpperCase(),  // titular (sin caracteres especiales)
        inv.totalComision.toFixed(2),           // monto
        referencia,                             // referencia
      ].join("|")
    );
  });

  // Footer
  lineas.push(
    [
      "F",
      invoices.length.toString().padStart(6, "0"),
      totalMonto.toFixed(2),
    ].join("|")
  );

  return lineas.join("\r\n") + "\r\n";
}
