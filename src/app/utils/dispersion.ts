// ============================================================
// Generador de archivo plano de dispersión de pagos
// Formato colombiano estándar para pagos ACH
// ============================================================

import type { Invoice } from "../store/appStore";
import type { AuthUser } from "../store/appStore";

/**
 * Genera un archivo plano (.txt) para dispersión de pagos.
 *
 * Formato:
 *   Header:   H|Fecha|Proveedor|TotalRegistros|TotalMonto
 *   Body:     D|NumeroCuenta|CLABE|TipoIdentificacion|NumeroIdentificacion|Banco|Titular|Monto|Referencia
 *   Footer:   F|TotalRegistros|TotalMonto
 *
 * Cada línea termina con \r\n (estándar Windows / mainframe).
 *
 * Los datos bancarios se leen del usuario activo (perfil). Si el
 * perfil no los tiene definidos, se omite el archivo plano con
 * un error explícito para evitar dispersiones incompletas.
 */
export function generarArchivoDispersion(invoices: Invoice[], user: AuthUser): string {
  if (!user.clabe || !user.banco || !user.tipoIdentificacion || !user.numeroIdentificacion) {
    throw new Error(
      `El usuario activo (${user.name}) no tiene datos bancarios completos. ` +
      "No se puede generar el archivo de dispersión."
    );
  }

  const fecha = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const lineas: string[] = [];

  const totalMonto = invoices.reduce((s, inv) => s + inv.totalComision, 0);

  // Header — incluye el nombre del usuario que dispersa como proveedor.
  lineas.push(
    [
      "H",
      fecha,
      `DISPERSION_${user.initials}_CONTINENTAL`,
      invoices.length.toString().padStart(6, "0"),
      totalMonto.toFixed(2),
    ].join("|")
  );

  // Body — una línea por factura usando los datos del usuario activo.
  invoices.forEach((inv) => {
    const titular = user.name;
    const referencia = `INV-${inv.id.replace("INV-", "")}`;

    lineas.push(
      [
        "D",
        user.cuenta ?? user.clabe.substring(0, 10),  // numero de cuenta
        user.clabe,                                   // CLABE interbancaria
        user.tipoIdentificacion,                      // tipo identificación
        user.numeroIdentificacion,                    // número identificación
        user.banco,                                   // banco
        titular.replace(/[^A-Z0-9 ]/gi, "").toUpperCase(), // titular (sin caracteres especiales)
        inv.totalComision.toFixed(2),                  // monto
        referencia,                                    // referencia
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
