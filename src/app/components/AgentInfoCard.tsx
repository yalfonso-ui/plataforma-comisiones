import { Building2, CreditCard, Hash, Mail, User } from "lucide-react";
import { useAppStore } from "../store/appStore";

export function AgentInfoCard() {
  // Placeholder data - Replace with actual agent data from backend
  const placeholderData = {
    beneficiario: "María García López",
    banco: "BBVA Bancomer",
    clabe: "012180001234567890",
    cuenta: "1234567890",
    correo: "maria.garcia@email.com",
    nivel: "Nivel 2 - Comercial Senior"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[#00184C]">Información del Agente</h3>
        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Demo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoItem
          icon={<User className="w-4 h-4" />}
          label="Beneficiario"
          value={placeholderData.beneficiario}
        />
        <InfoItem
          icon={<Hash className="w-4 h-4" />}
          label="Nivel"
          value={placeholderData.nivel}
        />
        <InfoItem
          icon={<Building2 className="w-4 h-4" />}
          label="Banco"
          value={placeholderData.banco}
        />
        <InfoItem
          icon={<Hash className="w-4 h-4" />}
          label="Clabe interbancaria"
          value={placeholderData.clabe}
        />
        <InfoItem
          icon={<CreditCard className="w-4 h-4" />}
          label="Número de cuenta"
          value={placeholderData.cuenta}
        />
        <InfoItem
          icon={<Mail className="w-4 h-4" />}
          label="Correo"
          value={placeholderData.correo}
        />
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-[#43D3FF]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm text-[#00184C] font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
