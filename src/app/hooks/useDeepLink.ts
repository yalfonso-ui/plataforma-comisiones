import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { Operation } from "../store/appStore";

export type StatusFilter = "all" | "pendiente" | "pendiente-recaudo" | "confirmado" | "disponible";

/**
 * Convierte un set de vouchers (seleccionados en Resumen) a un query string.
 * Útil para deep-linking desde KPIs a Cartera (/cartera) con un filtro aplicado.
 */
export function useDeepLink() {
  const [, setSearchParams] = useSearchParams();

  const navigateToCarteraWithFilter = useCallback(
    (filter: { status?: StatusFilter; voucher?: string; voucherIn?: string[] }) => {
      const params = new URLSearchParams();
      if (filter.status) params.set("status", filter.status);
      if (filter.voucher) params.set("voucher", filter.voucher);
      if (filter.voucherIn) {
        // Comprimir en una sola clave separada por comas para no inflar la URL
        if (filter.voucherIn.length <= 5) {
          params.set("voucherIn", filter.voucherIn.join(","));
        }
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  return { navigateToCarteraWithFilter };
}

/** Lee filtros de la query string y los aplica a operaciones. */
export function applyQueryFilters(
  operations: Operation[],
  statusParam: string | null,
  voucherParam: string | null,
  voucherInParam: string | null
): Operation[] {
  return operations.filter((op) => {
    if (statusParam && statusParam !== "all" && op.status !== statusParam) return false;
    if (voucherParam && !op.voucher.toLowerCase().includes(voucherParam.toLowerCase())) return false;
    if (voucherInParam) {
      const set = new Set(voucherInParam.split(","));
      if (!set.has(op.voucher)) return false;
    }
    return true;
  });
}
