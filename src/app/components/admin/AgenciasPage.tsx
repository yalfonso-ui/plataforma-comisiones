// ============================================================
// Módulo Agencias — CRUD completo (super_admin)
// Permite listar, crear, editar y desactivar agencias.
// ============================================================

import { useMemo, useState } from "react";
import { Plus, Edit2, Power, Building2, Search, X, Save } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { toast } from "sonner";
import {
  BTN_CTA,
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
  alertBg,
  alertIcon,
  alertText,
} from "../../utils/ui";
import type { Agencia, Pais } from "../../types/domain";

type FormData = Omit<Agencia, "id">;

const EMPTY_FORM: FormData = {
  nombre: "",
  pais: "CO",
  codigoEVA: "",
  contactoEmail: "",
  activa: true,
};

export function AgenciasPage() {
  const agencias = useAppStore((s) => s.agencias);
  const addAgencia = useAppStore((s) => s.addAgencia);
  const updateAgencia = useAppStore((s) => s.updateAgencia);
  const deleteAgencia = useAppStore((s) => s.deleteAgencia);

  const [searchTerm, setSearchTerm] = useState("");
  const [paisFilter, setPaisFilter] = useState<Pais | "all">("all");
  const [estadoFilter, setEstadoFilter] = useState<"activas" | "inactivas" | "todas">("activas");
  const [modalMode, setModalMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const filtered = useMemo(() => {
    return agencias.filter((a) => {
      if (estadoFilter === "activas" && !a.activa) return false;
      if (estadoFilter === "inactivas" && a.activa) return false;
      if (paisFilter !== "all" && a.pais !== paisFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !a.nombre.toLowerCase().includes(s) &&
          !a.codigoEVA.toLowerCase().includes(s) &&
          !a.contactoEmail.toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [agencias, searchTerm, paisFilter, estadoFilter]);

  const stats = useMemo(
    () => ({
      total: agencias.length,
      activas: agencias.filter((a) => a.activa).length,
      inactivas: agencias.filter((a) => !a.activa).length,
      paises: new Set(agencias.map((a) => a.pais)).size,
    }),
    [agencias]
  );

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalMode("create");
  };

  const handleOpenEdit = (agencia: Agencia) => {
    setForm({
      nombre: agencia.nombre,
      pais: agencia.pais,
      codigoEVA: agencia.codigoEVA,
      contactoEmail: agencia.contactoEmail,
      activa: agencia.activa,
    });
    setEditingId(agencia.id);
    setModalMode("edit");
  };

  const handleClose = () => {
    setModalMode("closed");
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const validateForm = (): string | null => {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (!form.codigoEVA.trim()) return "El código EVA es obligatorio";
    if (!form.contactoEmail.trim() || !form.contactoEmail.includes("@")) {
      return "Indica un email de contacto válido";
    }
    // Código EVA único (excepto en edición del mismo)
    const dup = agencias.find(
      (a) =>
        a.codigoEVA.toLowerCase() === form.codigoEVA.toLowerCase() &&
        a.id !== editingId
    );
    if (dup) return `El código EVA "${form.codigoEVA}" ya está registrado`;
    return null;
  };

  const handleSave = () => {
    const err = validateForm();
    if (err) {
      toast.error(err);
      return;
    }
    if (modalMode === "create") {
      addAgencia(form);
    } else if (modalMode === "edit" && editingId) {
      updateAgencia(editingId, form);
      toast.success("Agencia actualizada");
    }
    handleClose();
  };

  const handleToggleActiva = (agencia: Agencia) => {
    if (agencia.activa) {
      deleteAgencia(agencia.id); // soft-delete (la implementación la marca inactiva)
    } else {
      updateAgencia(agencia.id, { activa: true });
      toast.success("Agencia reactivada");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-azul-oscuro font-semibold mb-1">Gestión de Agencias</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Catálogo de agencias que radican solicitudes de facturación. Solo accesible para administradores.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className={`${BTN_CTA} px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Nueva agencia
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Total agencias" value={stats.total} color="bg-azul-oscuro text-white" />
        <KPI label="Activas" value={stats.activas} color="bg-success-soft text-success border border-success-border/30" />
        <KPI label="Inactivas" value={stats.inactivas} color="bg-danger-soft text-danger border border-danger-border/30" />
        <KPI label="Países" value={stats.paises} color="bg-celeste-soft text-azul-oscuro border border-celeste-subtle" />
      </div>

      {/* Toolbar de filtros */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4 flex flex-col md:flex-row gap-3`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar por nombre, código EVA o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
            aria-label="Buscar agencias"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value as "activas" | "inactivas" | "todas")}
          aria-label="Filtrar por estado"
          className="px-3 py-2 border border-border-base rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste bg-white"
        >
          <option value="activas">Solo activas</option>
          <option value="inactivas">Solo inactivas</option>
          <option value="todas">Todas</option>
        </select>
        <select
          value={paisFilter}
          onChange={(e) => setPaisFilter(e.target.value as Pais | "all")}
          aria-label="Filtrar por país"
          className="px-3 py-2 border border-border-base rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste bg-white"
        >
          <option value="all">Todos los países</option>
          <option value="CO">Colombia (CO)</option>
          <option value="MX">México (MX)</option>
        </select>
      </div>

      {/* Tabla */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-azul-oscuro font-semibold mb-1">Sin agencias</p>
            <p className={`text-sm ${TEXT_SECONDARY} mb-4`}>
              No hay agencias que coincidan con los filtros aplicados.
            </p>
            <button
              onClick={handleOpenCreate}
              className={`${BTN_CTA} inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold`}
            >
              <Plus className="w-4 h-4" />
              Crear la primera agencia
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas border-b border-border-base">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Agencia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Código EVA</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">País</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {filtered.map((agencia) => (
                  <tr key={agencia.id} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-celeste-soft rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-azul-oscuro" />
                        </div>
                        <span className="text-sm font-medium text-azul-oscuro">{agencia.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-azul-oscuro">{agencia.codigoEVA}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{agencia.pais}</span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${agencia.contactoEmail}`} className="text-sm text-celeste hover:underline">
                        {agencia.contactoEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {agencia.activa ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-soft text-success border border-success-border/30">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger border border-danger-border/30">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(agencia)}
                          aria-label={`Editar ${agencia.nombre}`}
                          className="p-2 rounded-lg hover:bg-celeste-soft transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-azul-oscuro" />
                        </button>
                        <button
                          onClick={() => handleToggleActiva(agencia)}
                          aria-label={agencia.activa ? `Desactivar ${agencia.nombre}` : `Reactivar ${agencia.nombre}`}
                          className={`p-2 rounded-lg transition-colors ${
                            agencia.activa
                              ? "hover:bg-danger-soft text-danger"
                              : "hover:bg-success-soft text-success"
                          }`}
                          title={agencia.activa ? "Desactivar" : "Reactivar"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalMode !== "closed" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-azul-oscuro font-semibold">
                {modalMode === "create" ? "Nueva agencia" : "Editar agencia"}
              </h3>
              <button onClick={handleClose} aria-label="Cerrar" className="p-1 hover:bg-canvas rounded">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Nombre">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Viajes y Turismo SA"
                  className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Código EVA">
                  <input
                    type="text"
                    value={form.codigoEVA}
                    onChange={(e) => setForm({ ...form, codigoEVA: e.target.value.toUpperCase() })}
                    placeholder="Ej: VYT-CO"
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm font-mono"
                  />
                </Field>
                <Field label="País">
                  <select
                    value={form.pais}
                    onChange={(e) => setForm({ ...form, pais: e.target.value as Pais })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm bg-white"
                  >
                    <option value="CO">Colombia (CO)</option>
                    <option value="MX">México (MX)</option>
                  </select>
                </Field>
              </div>
              <Field label="Email de contacto">
                <input
                  type="email"
                  value={form.contactoEmail}
                  onChange={(e) => setForm({ ...form, contactoEmail: e.target.value })}
                  placeholder="contacto@agencia.com"
                  className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
                />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                  className="w-4 h-4 text-celeste rounded border-border-base focus:ring-celeste accent-celeste"
                />
                <span className="text-sm text-azul-oscuro">Agencia activa</span>
              </label>
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <button onClick={handleClose} className={`${BTN_SECONDARY} px-4 py-2 rounded-lg text-sm font-medium`}>
                Cancelar
              </button>
              <button onClick={handleSave} className={`${BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2`}>
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`${color} rounded-xl shadow-sm p-4`}>
      <p className="text-xs opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-azul-oscuro mb-1 block">{label}</span>
      {children}
    </label>
  );
}
