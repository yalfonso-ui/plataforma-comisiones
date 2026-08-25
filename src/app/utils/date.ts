// Utilidades de fecha para "hace cuánto" en español

export function formatDistanceToNow(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 10) return "justo ahora";
  if (diffSec < 60) return `hace ${diffSec} segundo${diffSec > 1 ? "s" : ""}`;
  if (diffMin < 60) return `hace ${diffMin} minuto${diffMin > 1 ? "s" : ""}`;
  if (diffHr < 24) return `hace ${diffHr} hora${diffHr > 1 ? "s" : ""}`;
  if (diffDay < 7) return `hace ${diffDay} día${diffDay > 1 ? "s" : ""}`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
