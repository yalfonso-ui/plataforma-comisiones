import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Building2, Hash, CreditCard, User, IdCard } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { BTN_PRIMARY, BTN_SECONDARY, BORDER_DEFAULT, BG_CANVAS, TEXT_SECONDARY } from "../utils/ui";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const resetData = useAppStore((s) => s.resetData);

  const bank = {
    banco: "BBVA Bancomer",
    clabe: "0121 8000 1234 5678 90",
    cuenta: "1234 5678 90",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`${BTN_SECONDARY} p-2 rounded-lg inline-flex items-center gap-2`}
          aria-label="Volver"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-azul-oscuro mb-1">Mi perfil</h2>
          <p className={`text-sm ${TEXT_SECONDARY}`}>Información de tu cuenta y datos bancarios</p>
        </div>
      </div>

      {/* Identidad */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-2xl">
            {user?.initials ?? "AC"}
          </div>
          <div className="flex-1">
            <h3 className="text-azul-oscuro text-lg font-semibold">{user?.name ?? "Agente"}</h3>
            <p className={`text-sm ${TEXT_SECONDARY}`}>{user?.email ?? ""}</p>
            <p className="text-xs text-celeste mt-1 font-semibold uppercase tracking-wide inline-block px-2 py-0.5 bg-celeste-soft rounded">
              {user?.nivel ?? "Nivel 1 - Comercial"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={<User className="w-4 h-4" />} label="Nombre completo" value={user?.name ?? "—"} />
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Correo" value={user?.email ?? "—"} />
          <InfoRow icon={<IdCard className="w-4 h-4" />} label="Rol" value={user?.rol === "admin" ? "Administrador" : user?.rol === "supervisor" ? "Supervisor" : "Comercial"} />
          <InfoRow icon={<Hash className="w-4 h-4" />} label="ID Agente" value={`${user?.initials ?? "AC"}-2026`} />
        </div>
      </div>

      {/* Datos bancarios */}
      <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
        <h3 className="text-azul-oscuro mb-4">Datos bancarios para transferencias</h3>
        <p className={`text-xs ${TEXT_SECONDARY} mb-4`}>
          Estos datos se usarán para los pagos de tus comisiones. En producción se sincronizarán con tu backend.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Banco" value={bank.banco} />
          <InfoRow icon={<Hash className="w-4 h-4" />} label="CLABE interbancaria" value={bank.clabe} />
          <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Número de cuenta" value={bank.cuenta} />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            disabled
            className={`${BTN_PRIMARY} px-4 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed`}
            title="Disponible en producción"
          >
            Editar datos bancarios
          </button>
        </div>
      </div>

      {/* Zona peligrosa */}
      <div className={`bg-white rounded-xl shadow-sm border border-danger-border/30 p-6`}>
        <h3 className="text-danger mb-2 font-semibold">Zona de mantenimiento</h3>
        <p className={`text-sm ${TEXT_SECONDARY} mb-4`}>
          Restablece las comisiones y facturas a los datos de demostración. Esta acción no afecta tus credenciales.
        </p>
        <button
          onClick={() => {
            if (confirm("¿Restaurar todos los datos de demostración?")) {
              resetData();
              alert("Datos restaurados correctamente.");
            }
          }}
          className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/90 transition-colors text-sm font-semibold"
        >
          Restaurar datos demo
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={`${BG_CANVAS} rounded-lg p-3 flex items-start gap-3`}>
      <div className="text-celeste mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs ${TEXT_SECONDARY}`}>{label}</p>
        <p className="text-sm font-medium text-azul-oscuro truncate" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}
