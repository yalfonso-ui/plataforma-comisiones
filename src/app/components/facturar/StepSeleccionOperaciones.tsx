// ============================================================
// PASO 1 — Selección de operaciones
// Layout: header informativo → toolbar con DateFilter + acciones
// masivas → tabla con feedback de selección fuerte → banner de estado
// ============================================================

import { useMemo } from "react";
import { FileText, Info } from "lucide-react";
import type { Operation } from "../../store/appStore";
import { useDateFilterStore, getDateRange } from "../../store/dateFilterStore";
import { DateFilter } from "../DateFilter";
import { BORDER_DEFAULT, TEXT_SECONDARY } from "../../utils/ui";

interface StepSeleccionProps {
  operations: Operation[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
}

export function StepSeleccionOperaciones({
  operations,
  selectedIds,
  onToggle,
  onToggleAll,
}: StepSeleccionProps) {
  const { period, customStartDate, customEndDate } = useDateFilterStore();

  const dateRange = useMemo(
    () => getDateRange(period, customStartDate, customEndDate),
    [period, customStartDate, customEndDate]
  );

  const availableOps = useMemo(
    () =>
      operations.filter((op) => {
        const matchesStatus = op.status === "disponible";
        const opDate = new Date(op.fecha);
        const matchesDate = opDate >= dateRange.startDate && opDate <= dateRange.endDate;
        return matchesStatus && matchesDate;
      }),
    [operations, dateRange]
  );

  const allSelected = availableOps.length > 0 && selectedIds.size === availableOps.length;

  // ============================================================
  // Toolbar con DateFilter alineado a la derecha (jerarquía natural
  // como control de filtrado de la tabla).
  // ============================================================
  const Toolbar = (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        <span>
          {availableOps.length} operación{availableOps.length !== 1 ? "es" : ""} disponible
          {availableOps.length !== 1 ? "s" : ""} en el periodo seleccionado
        </span>
      </div>
      <DateFilter />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header con guía */}
      <div className={`bg-celeste-soft border border-celeste-subtle rounded-xl p-4`}>
        <h3 className="text-azul-oscuro font-semibold mb-1">Paso 1 — Selecciona las operaciones</h3>
        <p className={`text-sm ${TEXT_SECONDARY}`}>
          Marca una o más operaciones disponibles para incluirlas en la factura. Puedes
          seleccionarlas todas con el checkbox de la cabecera.
        </p>
      </div>

      {/* Toolbar: DateFilter arriba a la derecha + contador */}
      {Toolbar}

      {/* Tabla */}
      {availableOps.length === 0 ? (
        <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-12 text-center`}>
          <FileText className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-azul-oscuro font-semibold mb-1">No hay operaciones disponibles</p>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Cambia el rango de fecha o confirma pagos en Cartera para habilitar nuevas operaciones.
          </p>
        </div>
      ) : (
        <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              {/* Anchos fijos por columna para evitar saltos en md */}
              <colgroup>
                <col className="w-12" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="bg-canvas border-b border-border-base">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => onToggleAll(e.target.checked)}
                      aria-label="Seleccionar todas las operaciones"
                      className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    % Comisión
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-3 py-3 text-right text-[11px] font-semibold text-azul-oscuro uppercase tracking-wider">
                    Comisión
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {availableOps.map((op) => {
                  const isSelected = selectedIds.has(op.id);
                  return (
                    <tr
                      key={op.id}
                      onClick={() => onToggle(op.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-celeste-soft border-l-4 border-l-celeste"
                          : "hover:bg-canvas border-l-4 border-l-transparent"
                      }`}
                    >
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggle(op.id)}
                          aria-label={`Seleccionar ${op.voucher}`}
                          className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm font-medium ${isSelected ? "text-azul-oscuro" : "text-azul-oscuro"} truncate block`}>
                          {op.voucher}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm ${TEXT_SECONDARY} whitespace-nowrap`}>{op.fecha}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-sm ${TEXT_SECONDARY} truncate block`} title={op.plan}>
                          {op.plan}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm text-text-secondary whitespace-nowrap">
                          {op.porcentaje}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm text-text-secondary whitespace-nowrap">
                          ${op.base?.toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`text-sm font-semibold whitespace-nowrap ${
                            isSelected ? "text-celeste" : "text-azul-oscuro"
                          }`}
                        >
                          ${op.comision?.toLocaleString("es-MX")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Indicador de selección — banner persistente */}
      {selectedIds.size > 0 && (
        <div
          className="bg-azul-oscuro text-white rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm">
            <strong className="text-celeste">{selectedIds.size}</strong> operación
            {selectedIds.size > 1 ? "es" : ""} seleccionada{selectedIds.size > 1 ? "s" : ""}
          </span>
          <span className="text-xs text-white/70">Haz clic en "Siguiente" para continuar</span>
        </div>
      )}
    </div>
  );
}
