import { useEffect, useRef, useState } from "react";
import { LogOut, User, HelpCircle, Keyboard, ChevronUp, BookOpen, Clock } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useNavigate } from "react-router";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

interface UserMenuProps {
  lastLogin?: string;
}

const HELP_URL = "https://ayuda.continental.example/comisiones";

export function UserMenu({ lastLogin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const user = useAppStore((s) => s.user);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú de usuario"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-canvas transition-colors text-sm text-azul-oscuro ${open ? "bg-canvas" : ""}`}
      >
        <div className="w-8 h-8 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-semibold text-xs ring-2 ring-border-base">
          {user?.initials ?? "AC"}
        </div>
        <span
          className="hidden md:block max-w-[140px] truncate"
          title={user?.name}
        >
          {user?.name?.split(" ")[0] ?? "Agente"}
        </span>
        <ChevronUp
          className={`hidden md:block w-3.5 h-3.5 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menú de usuario"
          className={`absolute right-0 top-full mt-2 w-72 bg-white text-azul-oscuro rounded-xl shadow-2xl ${BORDER_DEFAULT} border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
        >
          {/* Cabecera del usuario */}
          <div className={`px-4 py-3 border-b ${BORDER_DEFAULT} bg-gradient-to-br from-azul-oscuro-soft to-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-celeste text-azul-oscuro rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.initials ?? "AC"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-azul-oscuro truncate">{user?.name ?? "Agente"}</p>
                <p className={`text-xs ${TEXT_SECONDARY} truncate`}>{user?.email ?? ""}</p>
              </div>
            </div>
            <p className="text-[10px] text-celeste mt-2 font-semibold uppercase tracking-wide inline-block px-2 py-0.5 bg-celeste-soft rounded">
              {user?.nivel ?? "Nivel 1 - Comercial"}
            </p>
          </div>

          {/* Acciones principales */}
          <div className="py-1">
            <MenuItem
              icon={User}
              label="Mi perfil"
              shortcut="P"
              onClick={() => { setOpen(false); navigate("/perfil"); }}
              isFirst
            />
            <MenuItem
              icon={HelpCircle}
              label="Ver tutorial de nuevo"
              onClick={() => { setOpen(false); resetOnboarding(); }}
            />
            <MenuItem
              icon={BookOpen}
              label="Ayuda / Documentación"
              onClick={() => { setOpen(false); window.open(HELP_URL, "_blank", "noopener,noreferrer"); }}
            />
            <MenuItem
              icon={Keyboard}
              label="Atajos de teclado"
              onClick={() => {
                setOpen(false);
                setTimeout(() => {
                  const btn = document.querySelector<HTMLButtonElement>('[aria-label="Ver atajos de teclado"]');
                  btn?.focus();
                  btn?.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
                }, 0);
              }}
            />
          </div>

          {/* Salir */}
          <div className={`border-t ${BORDER_DEFAULT} py-1 ${BG_CANVAS}`}>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-white flex items-center gap-3 text-danger font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1">Cerrar sesión</span>
              <kbd className="text-[10px] text-text-secondary/60 font-mono border border-border-base rounded px-1.5">⇧ Q</kbd>
            </button>
          </div>

          {/* Footer con última conexión + estado tutorial */}
          <div className={`px-4 py-2 border-t ${BORDER_DEFAULT} text-[10px] ${TEXT_SECONDARY} space-y-1`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{lastLogin ? `Última conexión: ${lastLogin}` : "Última conexión: hoy"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${onboardingCompleted ? "bg-success" : "bg-warning"}`} aria-hidden="true" />
              <span>{onboardingCompleted ? "Tutorial completado" : "Tutorial pendiente"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: typeof User;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  isFirst?: boolean;
}

function MenuItem({ icon: Icon, label, shortcut, onClick, isFirst }: MenuItemProps) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-canvas flex items-center gap-3 ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="text-[10px] text-text-secondary/60 font-mono border border-border-base rounded px-1.5">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
