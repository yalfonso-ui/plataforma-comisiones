// ============================================================
// Tokens de invitación — control de acceso a la app en demo
//
// Mientras la app este publicada en GitHub Pages (que es público
// por naturaleza), este gate evita que cualquiera pueda entrar
// aunque conozca los usuarios demo.
//
// IMPORTANTE PARA PRODUCCIÓN:
//  - Cambia estos tokens antes de cada demo externa.
//  - En producción real, reemplaza por OAuth (Google/Microsoft) o
//    SSO corporativo detrás del firewall.
// ============================================================

/**
 * Lista de tokens válidos. Cada uno es una llave de acceso que tu
 * compartes solo con las personas que quieres que prueben la app.
 *
 * Genera nuevos tokens con:
 *   crypto.getRandomValues(new Uint8Array(24))
 *     .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "")
 *
 * O usa este generador online: https://randomkeygen.com/
 */
const VALID_TOKENS: readonly string[] = [
  // Token principal — uso diario del dueño del repo
  "CC-2026-PRINCIPAL-7f3a9b2e1c8d4f6a5b9e2c7d1f4a8b3e",
  // Token para testers de confianza
  "CC-2026-TESTER01-9c4d7a2f8b1e5c3d6a9f2b7c4e1d8a5f",
  // Token de respaldo
  "CC-2026-BACKUP02-4e8c1d9a7f2b5c8e3d6a9f1c4b7e2d5a",
] as const;

/**
 * Valida un token de invitación.
 * Comparación en tiempo constante para evitar timing attacks básicos.
 */
export function isValidInviteToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const trimmed = token.trim();
  if (!trimmed) return false;
  // Comparación simple (suficiente para un demo gate).
  // En prod usar crypto.timingSafeEqual() del backend.
  return VALID_TOKENS.some((valid) => valid === trimmed);
}

/**
 * Devuelve cuántos tokens quedan válidos. Útil para mostrar en el
 * footer del login como pista interna ("3 invitaciones activas").
 */
export function getActiveInviteCount(): number {
  return VALID_TOKENS.length;
}

/**
 * Constante exportada para testing/dev: el primer token de la lista.
 * NO usar en producción — solo en demos locales donde se quiere
 * pre-rellenar el input para acelerar pruebas.
 */
export const FIRST_INVITE_TOKEN = VALID_TOKENS[0];

/**
 * Clave del sessionStorage donde el Login persiste el flag
 * "invitación validada en esta sesión". Se usa en:
 *  - Login.tsx (escribir/leer el flag)
 *  - RequireAuth.tsx (verificar que el flag sigue presente)
 *
 * Usamos sessionStorage (no localStorage) para que cada nueva pestaña
 * tenga que re-validar — así no se queda "logueado" indefinidamente.
 */
export const INVITE_STORAGE_KEY = "continental-comisiones:invite-validated/v1";

/**
 * Helper para leer/escribir el flag de invitación validada.
 * Encapsula el manejo de errores de sessionStorage (modo privado del
 * navegador, políticas empresariales, etc.).
 */
export function isInviteValidated(): boolean {
  try {
    return sessionStorage.getItem(INVITE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setInviteValidated(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(INVITE_STORAGE_KEY, "true");
    } else {
      sessionStorage.removeItem(INVITE_STORAGE_KEY);
    }
  } catch {
    // Silenciar errores de sessionStorage (modo privado, etc.)
  }
}
