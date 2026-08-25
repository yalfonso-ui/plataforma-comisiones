import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { X, LogOut, User, HelpCircle } from "lucide-react";
import logoContinental from "../../assets/Logo continental.png";
import { useAppStore } from "../store/appStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SidebarNav } from "./SidebarNav";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  availableCount: number;
  pendingCount: number;
}

export function MobileMenuDrawer({ open, onClose, onLogout, availableCount, pendingCount }: MobileMenuDrawerProps) {
  const user = useAppStore((s) => s.user);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const navigate = useNavigate();
  const location = useLocation();

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Cerrar al cambiar de ruta (al hacer tap en un nav item)
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
      {/* Backdrop */}
      <button
        aria-label="Cerrar menú"
        className="absolute inset-0 bg-azul-oscuro/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header del drawer */}
        <div className="bg-azul-oscuro text-white px-6 py-5 flex items-center justify-between">
          <ImageWithFallback
            src={logoContinental}
            alt="Logo Continental"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Datos del usuario */}
        <div className={`px-6 py-5 border-b ${BORDER_DEFAULT} ${BG_CANVAS}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
              {user?.initials ?? "AC"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-azul-oscuro truncate">{user?.name ?? "Agente"}</p>
              <p className={`text-xs ${TEXT_SECONDARY} truncate`}>{user?.email ?? ""}</p>
              <p className="text-[10px] text-celeste mt-1 font-medium uppercase tracking-wide">
                {user?.nivel ?? ""}
              </p>
            </div>
          </div>
        </div>

        {/* Nav compartido (mismo que sidebar desktop) */}
        <SidebarNav
          availableCount={availableCount}
          pendingCount={pendingCount}
          compact
          listClassName="px-3 space-y-1"
        />

        {!onboardingCompleted && (
          <div className="mx-3 mt-2">
            <button
              onClick={() => { resetOnboarding(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-celeste-soft text-azul-oscuro hover:bg-celeste-subtle transition-colors text-sm font-medium border border-celeste-subtle"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="flex-1 text-left">Ver tutorial de nuevo</span>
            </button>
          </div>
        )}

        {/* Footer con acciones secundarias */}
        <div className={`border-t ${BORDER_DEFAULT} p-3 space-y-1`}>
          <button
            onClick={() => { navigate("/perfil"); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg ${TEXT_SECONDARY} hover:bg-canvas hover:text-azul-oscuro transition-colors text-sm`}
          >
            <User className="w-5 h-5" />
            <span className="flex-1 text-left">Mi perfil</span>
          </button>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-danger hover:bg-danger-soft transition-colors text-sm font-medium`}
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
