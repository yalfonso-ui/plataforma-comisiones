import { Building2, CreditCard, Hash, Mail, User, IdCard, Copy, Check } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useState } from "react";
import { BORDER_DEFAULT, TEXT_SECONDARY } from "../utils/ui";

export function AgentInfoCard() {
  const user = useAppStore((s) => s.user);
  const resetData = useAppStore((s) => s.resetData);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);

  const beneficiario = user?.name ?? "Agente Continental";
  const correo = user?.email ?? "agente@continental.com";
  const nivel = user?.nivel ?? "Nivel 1 - Comercial";

  const bank = {
    banco: "BBVA Bancomer",
    clabe: "0121 8000 1234 5678 90",
    cuenta: "1234 5678 90",
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${BORDER_DEFAULT} border p-6`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-azul-oscuro">Información del Agente</h3>
          {!onboardingCompleted && (
            <span
              className="text-xs px-2 py-1 bg-warning-soft text-warning-border rounded-full"
              title="Aún no has visto el tutorial"
            >
              Nuevo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className={`text-xs ${TEXT_SECONDARY}`}>
            ID: <span className="font-mono font-medium text-azul-oscuro">{user?.initials ?? "AC"}-2026</span>
          </p>
          <button
            onClick={() => {
              if (confirm("¿Restaurar las comisiones y facturas a los datos de demostración?")) {
                resetData();
              }
            }}
            className={`text-xs ${TEXT_SECONDARY} hover:text-azul-oscuro underline transition-colors`}
            title="Restaurar operaciones y facturas de demostración"
          >
            Resetear demo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoItem icon={<User className="w-4 h-4" />} label="Beneficiario" value={beneficiario} />
        <InfoItem icon={<IdCard className="w-4 h-4" />} label="Nivel" value={nivel} />
        <InfoItem icon={<Building2 className="w-4 h-4" />} label="Banco" value={bank.banco} />
        <InfoItem icon={<Hash className="w-4 h-4" />} label="CLABE interbancaria" value={bank.clabe} copyable />
        <InfoItem icon={<CreditCard className="w-4 h-4" />} label="Número de cuenta" value={bank.cuenta} copyable />
        <InfoItem icon={<Mail className="w-4 h-4" />} label="Correo" value={correo} copyable />
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, copyable = false }: { icon: React.ReactNode; label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silencio si la API no está disponible
    }
  };

  return (
    <div className="group flex items-start gap-3">
      <div className="mt-1 text-celeste">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs ${TEXT_SECONDARY} mb-1`}>{label}</p>
        <p className="text-sm text-azul-oscuro font-medium truncate" title={value}>
          {value}
        </p>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          aria-label={`Copiar ${label}`}
          title={copied ? "Copiado" : "Copiar"}
          className={`opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1 rounded hover:bg-canvas ${TEXT_SECONDARY} hover:text-azul-oscuro`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
