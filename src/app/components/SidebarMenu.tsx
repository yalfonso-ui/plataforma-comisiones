import { useNavigate } from "react-router";
import { LogOut, User, HelpCircle } from "lucide-react";
import { useRef } from "react";
import { useAppStore } from "../store/appStore";
import { SidebarNav } from "./SidebarNav";
import { CollapsibleSidebar, SIDEBAR_WIDTHS } from "./CollapsibleSidebar";
import { RailTooltip } from "./RailTooltip";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

interface SidebarMenuProps {
  /** Abre el modal de confirmación de logout. */
  onRequestLogout: () => void;
  /** Operaciones disponibles (badge). */
  availableCount: number;
  /** Operaciones pendientes (badge). */
  pendingCount: number;
  /**
   * Si true, el sidebar se renderiza dentro de un contenedor padre
   * (típicamente el off-canvas móvil < md). En ese caso NO usa `fixed`
   * ni `top-16`: ocupa el 100% del alto del padre.
   */
  embedded?: boolean;
}

/**
 * Sidebar persistente colapsable (Rail / Drawer).
 *
 * Reemplaza al antiguo `OffCanvasDrawer` que se comportaba como un modal
 * flotante con backdrop y translate-x. Ahora:
 *  - Vive debajo de la Navbar fija (`fixed top-16`).
 *  - Comparte eje horizontal con el contenido (ml-16 / ml-72).
 *  - El cambio de ancho es fluido (`transition-[width] duration-300`).
 *  - El trigger flotante vive en el borde lateral superior del sidebar.
 *
 * Comportamiento por estado:
 *  - Expandido (w-60): cabecera con datos del usuario, nav con etiquetas
 *    y acordeones, footer con acciones secundarias.
 *  - Rail (w-16): avatar circular, nav solo iconos con tooltips,
 *    footer solo iconos con tooltips.
 *
 * Accesibilidad:
 *  - Landmarks <aside> + <nav> con `aria-label`.
 *  - Tooltips via `title` (nativo) + `aria-describedby` en hover/focus.
 *  - Trigger con `aria-expanded` y `aria-controls`.
 */
export function SidebarMenu({
  onRequestLogout,
  availableCount,
  pendingCount,
  embedded = false,
}: SidebarMenuProps) {
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const navigate = useNavigate();

  // Refs para los tooltips del modo rail (uno por elemento interactivo).
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const tourRef = useRef<HTMLButtonElement | null>(null);
  const logoutRef = useRef<HTMLButtonElement | null>(null);

  return (
    <CollapsibleSidebar ariaLabel="Menú principal de Continental Comisiones" embedded={embedded}>
      {({ expanded }) => (
        <div className="flex flex-col h-full min-h-0">
          {/* Sin cabecera de usuario: la info del agente vive en el UserMenu del navbar superior.
              La nav arranca directamente para mantener el sidebar limpio y sin redundancias. */}
          <SidebarNav
            availableCount={availableCount}
            pendingCount={pendingCount}
            collapsed={!expanded}
            listClassName="px-3 py-1 space-y-0.5"
          />

          {/* Footer con acciones secundarias */}
          {expanded ? (
            <div className={`border-t ${BORDER_DEFAULT} p-2 space-y-0.5 bg-white`}>
              <button
                onClick={() => navigate("/perfil")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${TEXT_SECONDARY} hover:bg-canvas hover:text-azul-oscuro transition-colors text-sm`}
              >
                <User className="w-5 h-5" />
                <span className="flex-1 text-left">Mi perfil</span>
              </button>

              {!onboardingCompleted && (
                <button
                  onClick={resetOnboarding}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-celeste-soft text-azul-oscuro hover:bg-celeste-subtle transition-colors text-sm font-medium border border-celeste-subtle"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="flex-1 text-left">Ver tutorial de nuevo</span>
                </button>
              )}

              <button
                onClick={onRequestLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-danger hover:bg-danger-soft transition-colors text-sm font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left">Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div className={`border-t ${BORDER_DEFAULT} py-2 bg-white`}>
              <ul className="space-y-0.5 px-2">
                <li>
                  <button
                    ref={profileBtnRef}
                    onClick={() => navigate("/perfil")}
                    title="Mi perfil"
                    aria-label="Mi perfil"
                    className={`w-full relative flex items-center justify-center px-0 py-2.5 rounded-lg ${TEXT_SECONDARY} hover:bg-canvas hover:text-azul-oscuro transition-colors`}
                  >
                    <User className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <RailTooltip anchorRef={profileBtnRef} label="Mi perfil" />
                </li>

                {!onboardingCompleted && (
                  <li>
                    <button
                      ref={tourRef}
                      onClick={resetOnboarding}
                      title="Ver tutorial de nuevo"
                      aria-label="Ver tutorial de nuevo"
                      className="w-full relative flex items-center justify-center px-0 py-2.5 rounded-lg text-azul-oscuro bg-celeste-soft hover:bg-celeste-subtle transition-colors"
                    >
                      <HelpCircle className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <RailTooltip anchorRef={tourRef} label="Ver tutorial" />
                  </li>
                )}

                <li>
                  <button
                    ref={logoutRef}
                    onClick={onRequestLogout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                    className="w-full relative flex items-center justify-center px-0 py-2.5 rounded-lg text-danger hover:bg-danger-soft transition-colors"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <RailTooltip anchorRef={logoutRef} label="Cerrar sesión" variant="danger" />
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </CollapsibleSidebar>
  );
}

// Re-exportamos los anchos para que el layout los pueda consumir sin acoplarse al componente.
export { SIDEBAR_WIDTHS };
