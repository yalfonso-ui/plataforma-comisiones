// ============================================================
// Módulo Usuarios — Gestión de usuarios y asignación de roles
// Solo accesible para super_admin.
// ============================================================

import { useMemo, useState } from "react";
import { Plus, Edit2, UserCog, Mail, Lock, ChevronDown, X, Save, Trash2 } from "lucide-react";
import { useAppStore } from "../../store/appStore";
import { toast } from "sonner";
import { ROLE_META, type AppRole } from "../../auth/permissions";
import {
  BTN_CTA,
  BTN_PRIMARY,
  BTN_SECONDARY,
  TEXT_SECONDARY,
  BORDER_DEFAULT,
} from "../../utils/ui";

interface UserRow {
  email: string;
  name: string;
  initials: string;
  rol: AppRole;
  nivel: string;
  password?: string;
  /** Indica si es un usuario nuevo (no persistido). */
  isNew?: boolean;
}

const SEED_USERS: UserRow[] = [
  { email: "maria.garcia@continental.com", name: "María García López", initials: "MG", rol: "comercial", nivel: "Comercial Senior", password: "demo" },
  { email: "cartera@continental.com", name: "Andrea Ramírez", initials: "AR", rol: "cartera", nivel: "Analista de Cartera", password: "demo" },
  { email: "comisiones@continental.com", name: "Luis Torres", initials: "LT", rol: "comisiones", nivel: "Analista de Comisiones", password: "demo" },
  { email: "admin@continental.com", name: "Sistemas Admin", initials: "SA", rol: "super_admin", nivel: "Admin TI", password: "demo" },
];

const ROLE_BADGE: Record<AppRole, string> = {
  comercial: "bg-celeste-soft text-azul-oscuro border-celeste-subtle",
  cartera: "bg-warning-soft text-warning-border border-warning-border/30",
  comisiones: "bg-info-soft text-info-border border-info-border/30",
  super_admin: "bg-azul-oscuro text-white border-azul-oscuro",
};

export function UsuariosPage() {
  // Estado local para usuarios creados (no se persisten en demo).
  // En producción, esto debería venir de un store/backend.
  const [extraUsers, setExtraUsers] = useState<UserRow[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [rolFilter, setRolFilter] = useState<AppRole | "all">("all");
  const [modalMode, setModalMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<UserRow>({
    email: "",
    name: "",
    initials: "",
    rol: "comercial",
    nivel: "",
    password: "",
  });

  const allUsers = useMemo(() => {
    return [...SEED_USERS, ...extraUsers];
  }, [extraUsers]);

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (rolFilter !== "all" && u.rol !== rolFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !u.name.toLowerCase().includes(s) &&
          !u.email.toLowerCase().includes(s) &&
          !u.nivel.toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allUsers, searchTerm, rolFilter]);

  const stats = useMemo(() => {
    const byRol: Record<AppRole, number> = {
      comercial: 0,
      cartera: 0,
      comisiones: 0,
      super_admin: 0,
    };
    allUsers.forEach((u) => {
      byRol[u.rol]++;
    });
    return {
      total: allUsers.length,
      byRol,
    };
  }, [allUsers]);

  const handleOpenCreate = () => {
    setForm({
      email: "",
      name: "",
      initials: "",
      rol: "comercial",
      nivel: "",
      password: "",
    });
    setEditingIdx(null);
    setModalMode("create");
  };

  const handleOpenEdit = (idx: number) => {
    setForm({ ...allUsers[idx] });
    setEditingIdx(idx);
    setModalMode("edit");
  };

  const handleClose = () => {
    setModalMode("closed");
    setEditingIdx(null);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "El nombre es obligatorio";
    if (!form.email.trim() || !form.email.includes("@")) return "Email inválido";
    if (modalMode === "create" && (!form.password || form.password.length < 4)) {
      return "La contraseña debe tener al menos 4 caracteres";
    }
    const dup = allUsers.find(
      (u) => u.email.toLowerCase() === form.email.toLowerCase() && (editingIdx === null || allUsers.indexOf(u) !== editingIdx)
    );
    if (dup) return `El email "${form.email}" ya está registrado`;
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    // Auto-generar initials
    const initials = form.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    const finalUser: UserRow = {
      ...form,
      initials: initials || form.initials || form.email[0]?.toUpperCase() || "?",
    };

    if (modalMode === "create") {
      setExtraUsers((prev) => [...prev, finalUser]);
      toast.success("Usuario creado", {
        description: `${finalUser.email} ya puede iniciar sesión.`,
      });
    } else if (modalMode === "edit" && editingIdx !== null) {
      if (editingIdx < SEED_USERS.length) {
        toast.info("Demo", {
          description: "Los usuarios seed no son editables en esta demo.",
        });
        handleClose();
        return;
      }
      const realIdx = editingIdx - SEED_USERS.length;
      setExtraUsers((prev) => prev.map((u, i) => (i === realIdx ? finalUser : u)));
      toast.success("Usuario actualizado");
    }
    handleClose();
  };

  const handleDelete = (idx: number) => {
    if (idx < SEED_USERS.length) {
      toast.info("Demo", {
        description: "Los usuarios seed no se pueden eliminar en esta demo.",
      });
      return;
    }
    const realIdx = idx - SEED_USERS.length;
    setExtraUsers((prev) => prev.filter((_, i) => i !== realIdx));
    toast.success("Usuario eliminado");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-azul-oscuro font-semibold mb-1">Gestión de Usuarios</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>
            Crea, edita y asigna roles a los usuarios del sistema. Solo accesible para administradores.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className={`${BTN_CTA} px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* KPIs por rol */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI label="Total" value={stats.total} color="bg-azul-oscuro text-white" />
        <KPI label="Comerciales" value={stats.byRol.comercial} color="bg-celeste-soft text-azul-oscuro border border-celeste-subtle" />
        <KPI label="Cartera" value={stats.byRol.cartera} color="bg-warning-soft text-warning border border-warning-border/30" />
        <KPI label="Comisiones" value={stats.byRol.comisiones} color="bg-info-soft text-info border border-info-border/30" />
        <KPI label="Admins" value={stats.byRol.super_admin} color="bg-danger-soft text-danger border border-danger-border/30" />
      </div>

      {/* Toolbar */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-4 flex flex-col md:flex-row gap-3`}>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por nombre, email o nivel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
            aria-label="Buscar usuarios"
          />
        </div>
        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value as AppRole | "all")}
          aria-label="Filtrar por rol"
          className="px-3 py-2 border border-border-base rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste bg-white"
        >
          <option value="all">Todos los roles</option>
          {Object.entries(ROLE_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas border-b border-border-base">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Nivel</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-azul-oscuro uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {filtered.map((user, idx) => {
                const realIdx = allUsers.indexOf(user);
                const isSeed = realIdx < SEED_USERS.length;
                return (
                  <tr key={user.email} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {user.initials}
                        </div>
                        <span className="text-sm font-medium text-azul-oscuro">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary font-mono">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[user.rol]}`}>
                        <UserCog className="w-3 h-3" />
                        {ROLE_META[user.rol].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">{user.nivel}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(realIdx)}
                          aria-label={`Editar ${user.name}`}
                          className="p-2 rounded-lg hover:bg-celeste-soft transition-colors"
                          title={isSeed ? "Ver detalle (seed)" : "Editar"}
                        >
                          <Edit2 className="w-4 h-4 text-azul-oscuro" />
                        </button>
                        {!isSeed && (
                          <button
                            onClick={() => handleDelete(realIdx)}
                            aria-label={`Eliminar ${user.name}`}
                            className="p-2 rounded-lg hover:bg-danger-soft text-danger transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <UserCog className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-azul-oscuro font-semibold mb-1">Sin usuarios</p>
                    <p className={`text-sm ${TEXT_SECONDARY}`}>
                      No hay usuarios que coincidan con los filtros aplicados.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalMode !== "closed" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-azul-oscuro font-semibold">
                {modalMode === "create" ? "Nuevo usuario" : "Editar usuario"}
              </h3>
              <button onClick={handleClose} aria-label="Cerrar" className="p-1 hover:bg-canvas rounded">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Nombre completo" icon={<UserCog className="w-3 h-3" />}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="w-full pl-8 pr-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
                />
              </Field>
              <Field label="Email" icon={<Mail className="w-3 h-3" />}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@continental.com"
                  className="w-full pl-8 pr-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm font-mono"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rol">
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as AppRole })}
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm bg-white"
                  >
                    {Object.entries(ROLE_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Nivel">
                  <input
                    type="text"
                    value={form.nivel}
                    onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                    placeholder="Ej: Senior"
                    className="w-full px-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm"
                  />
                </Field>
              </div>
              {modalMode === "create" && (
                <Field label="Contraseña" icon={<Lock className="w-3 h-3" />}>
                  <input
                    type="text"
                    value={form.password ?? ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-8 pr-3 py-2 border border-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-celeste focus:border-celeste text-sm font-mono"
                  />
                </Field>
              )}
              <div className="text-xs text-text-secondary bg-canvas rounded-lg p-3">
                <ChevronDown className="w-3 h-3 inline mr-1" />
                {ROLE_META[form.rol].descripcion}
              </div>
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

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-azul-oscuro mb-1 block">{label}</span>
      <div className="relative">
        {icon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
    </label>
  );
}
