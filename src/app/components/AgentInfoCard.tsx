import { Building2, CreditCard, Hash, Mail } from "lucide-react";

export function AgentInfoCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-[#00184C] mb-4">Información del Agente</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoItem
          icon={<CreditCard className="w-4 h-4" />}
          label="Beneficiario"
          value="Agente XXXXXXXX – validar todos los niveles"
        />
        <InfoItem
          icon={<Building2 className="w-4 h-4" />}
          label="Banco"
          value="BBVA Bancomer"
        />
        <InfoItem
          icon={<Hash className="w-4 h-4" />}
          label="Clabe interbancaria"
          value="012180001234567890"
        />
        <InfoItem
          icon={<Hash className="w-4 h-4" />}
          label="Número de cuenta"
          value="0123456789"
        />
        <InfoItem
          icon={<Mail className="w-4 h-4" />}
          label="Correo"
          value="agente@example.com"
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
