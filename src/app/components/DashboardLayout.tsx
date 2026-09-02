import { Outlet, useNavigate } from "react-router";
import { NavLink } from "react-router";
import { AgentInfoCard } from "./AgentInfoCard";
import { Breadcrumb } from "./Breadcrumb";
import { useAppStore } from "../store/appStore";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { OnboardingModal } from "./OnboardingModal";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import { GlobalSearch } from "./GlobalSearch";
import { useGlobalShortcuts } from "../hooks/useGlobalShortcuts";
import { SidebarMenu } from "./SidebarMenu";
import { useUIStore } from "../store/uiStore";
import logoOriginal from "../../assets/logo-original.png";

/** Breakpoint `md` de Tailwind = 768 px. */
const MD_BREAKPOINT = 768;

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/**
 * Layout principal del dashboard.
 *
 * Jerarquía del layout:
 *  - Navbar superior  : sticky top-0 z-30 h-16 w-full (logo / búsqueda / notificaciones / usuario).
 *  - Sidebar lateral  : fixed top-16 z-10 (Rail w-16 / Drawer w-60)
 *                       con `transition-[width] duration-300 ease-in-out`.
 *  - Contenido       : <main> con `ml-16` o `ml-60` según `sidebarExpanded`,
 *                       `transition-[margin] duration-300 ease-in-out`.
 *
 * Comportamiento responsive:
 *  - En ≥ md: sidebar persistente (Rail/Drawer) bajo la Navbar.
 *  - En < md: el sidebar se transforma en off-canvas flotante con backdrop
 *    (controlado por `mobileOpen`) para no挤压 el contenido en pantallas estrechas.
 *
 * Estado:
 *  - Persistente: `uiStore.sidebarExpanded` (lee/migra desde localStorage).
 *  - Efímero:     `mobileOpen` (solo < md, no persistido).
 *
 * Accesibilidad:
 *  - Skip link "Saltar al contenido principal".
 *  - Botón hamburguesa con `aria-expanded` + `aria-controls`.
 *  - ESC cierra el off-canvas móvil.
 */
export function DashboardLayout() {
  const operations = useAppStore((s) => s.operations);
  const logout = useAppStore((s) => s.logout);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const lastLogin = useAppStore((s) => s.lastLogin);
  const navigate = useNavigate();

  const sidebarExpanded = useUIStore((s) => s.sidebarExpanded);

  const availableCount = operations.filter((op) => op.status === "disponible").length;
  const pendingCount = operations.filter((op) => op.status === "pendiente").length;

  // Formatear última conexión para el menú de usuario
  const lastLoginLabel = lastLogin
    ? new Date(lastLogin).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  // Estado móvil: cuando el sidebar funciona como off-canvas (< md).
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // Si el viewport pasa a ≥ md mientras el off-canvas móvil está abierto,
  // lo cerramos automáticamente para evitar estados fantasma.
  useEffect(() => {
    if (isDesktop && mobileOpen) setMobileOpen(false);
  }, [isDesktop, mobileOpen]);

  useGlobalShortcuts();

  // Cerrar off-canvas móvil con ESC.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Bloqueo de scroll mientras el off-canvas móvil está abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  // Clases dinámicas del <main> según el estado del sidebar.
  // En ≥ md se compensa el ancho del sidebar con margin-left.
  // En < md no hay sidebar persistente (es off-canvas).
  const mainMargin = sidebarExpanded ? "md:ml-60" : "md:ml-16";

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-azul-oscuro focus:px-3 focus:py-2 focus:rounded focus:shadow"
      >
        Saltar al contenido principal
      </a>

      {/* Top bar limpio — fija arriba, ancho completo.
          Jerarquía: [Logo] a la izquierda · [Search][Notif][User] a la derecha.
          La nav principal vive en el Sidebar (no aquí). */}
      <header className="bg-white/80 backdrop-blur-md text-azul-oscuro sticky top-0 z-30 border-b border-border-base">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
          {/* Izquierda: hamburguesa móvil (≥ md se oculta; el sidebar vive debajo) + logo de marca */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú principal"
              aria-expanded={mobileOpen}
              aria-controls="mobile-sidebar"
              className="md:hidden p-2 rounded-lg hover:bg-canvas transition-colors text-azul-oscuro"
            >
              <Menu className="w-5 h-5" />
            </button>

            <NavLink to="/resumen" aria-label="Ir a inicio" className="flex items-center">
              <img
                src={logoOriginal}
                alt="Continental Comisiones"
                className="h-10 w-auto"
              />
            </NavLink>
          </div>

          {/* Centro/derecha: búsqueda global — elemento más importante del navbar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <GlobalSearch />
          </div>

          {/* Derecha: notificaciones + usuario */}
          <div className="flex items-center gap-2">
            {/* Search visible solo en mobile */}
            <div className="md:hidden">
              <GlobalSearch />
            </div>

            <NotificationsBell />
            <UserMenu lastLogin={lastLoginLabel} />
          </div>
        </div>
      </header>

      {/* Sidebar persistente (≥ md) — Rail o Drawer.
          Solo se monta en desktop para evitar doble árbol React y
          duplicación de cabeceras cuando se abre el off-canvas móvil. */}
      {isDesktop && (
        <SidebarMenu
          onRequestLogout={() => setLogoutConfirmOpen(true)}
          availableCount={availableCount}
          pendingCount={pendingCount}
        />
      )}

      {/* Contenido principal — compensa el ancho del sidebar en ≥ md.
          Estrategia: contenedor a ancho completo con margin-left dinámico;
          el `max-w-[1400px]` se aplica al wrapper interior con auto-margins
          para mantener el centrado respecto al área visible (no al viewport). */}
      <main
        id="main-content"
        // =================================================================
        // RED DE SEGURIDAD para position: sticky:
        //  - `transition-[margin-left]` explícito (NO `transition-[margin]`)
        //    porque en algunos navegadores `transition-[margin]` activa
        //    compositor + transform, lo que ROMPE position: sticky en
        //    TODOS los descendientes.
        //  - `overflow-x-visible` explícito. Por defecto Tailwind 4 y algunos
        //    resets ponen `overflow-x: hidden` en `<main>`, lo que crea un
        //    nuevo scroll container y rompe sticky.
        //  - Sin `transform`, sin `filter`, sin `will-change`, sin `contain`.
        // =================================================================
        className={`${mainMargin} transition-[margin-left] duration-300 ease-in-out min-h-[calc(100vh-4rem)] overflow-x-visible`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-visible">
          <AgentInfoCard />
          <div className="mt-6">
            <Breadcrumb />
            <Outlet />
          </div>
        </div>
      </main>

      {/* Off-canvas móvil (< md): backdrop + sidebar temporal */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 opacity-100"
          />
          <div
            id="mobile-sidebar"
            className="md:hidden fixed top-0 left-0 h-screen w-80 max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out translate-x-0"
          >
            {/* Cabecera móvil con botón cerrar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-base bg-white sticky top-0 z-10">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-azul-oscuro hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="text-sm font-medium">Cerrar</span>
              </button>
              <span className="ml-auto text-sm font-semibold text-azul-oscuro truncate">
                Menú
              </span>
            </div>

            {/* En móvil, forzamos el sidebar expandido para máximo confort. */}
            <div className="flex-1 overflow-y-auto">
              <SidebarMenu
                embedded
                onRequestLogout={() => {
                  setMobileOpen(false);
                  setLogoutConfirmOpen(true);
                }}
                availableCount={availableCount}
                pendingCount={pendingCount}
              />
            </div>
          </div>
        </>
      )}

      {/* Confirmación de logout */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        intent="warning"
        title="¿Cerrar sesión?"
        description="Podrás volver a ingresar cuando quieras. Tu información quedará guardada."
        cancelLabel="Cancelar"
        confirmAction={{
          label: "Sí, cerrar sesión",
          variant: "danger",
          onClick: handleConfirmLogout,
        }}
      />

      <OnboardingModal />
    </div>
  );
}
