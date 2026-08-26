import { Outlet, useNavigate } from "react-router";
import { AgentInfoCard } from "./AgentInfoCard";
import { Breadcrumb } from "./Breadcrumb";
import { useAppStore } from "../store/appStore";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { Menu, HelpCircle } from "lucide-react";
import { OnboardingModal } from "./OnboardingModal";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { ConfirmDialog } from "./ConfirmDialog";
import { GlobalSearch } from "./GlobalSearch";
import { KeyboardShortcutsTooltip } from "./KeyboardShortcutsTooltip";
import { useGlobalShortcuts } from "../hooks/useGlobalShortcuts";
import { Sidebar } from "./Sidebar";
import logoContinental from "../../assets/Logo continental.png";

export function DashboardLayout() {
  const operations = useAppStore((s) => s.operations);
  const logout = useAppStore((s) => s.logout);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const onboardingCompleted = useAppStore((s) => s.onboardingCompleted);
  const lastLogin = useAppStore((s) => s.lastLogin);
  const navigate = useNavigate();

  const availableCount = operations.filter(op => op.status === "disponible").length;
  const pendingCount = operations.filter(op => op.status === "pendiente").length;

  // Formatear última conexión para el menú de usuario
  const lastLoginLabel = lastLogin
    ? new Date(lastLogin).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useGlobalShortcuts();

  // Cerrar menú móvil con Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-azul-oscuro focus:px-3 focus:py-2 focus:rounded focus:shadow"
      >
        Saltar al contenido principal
      </a>

      {/* Sidebar izquierdo (desktop) */}
      <Sidebar />

      {/* Columna principal */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar blanco */}
        <header className="bg-white text-azul-oscuro sticky top-0 z-50 border-b border-border-base">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
            {/* Izquierda: toggle colapsar (desktop) + hamburguesa (móvil) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={mobileMenuOpen}
                className="lg:hidden p-2 rounded-lg hover:bg-canvas transition-colors text-azul-oscuro"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="lg:hidden flex items-center">
                <ImageWithFallback
                  src={logoContinental}
                  alt="Logo Continental - Gestión de Comisiones"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>

            {/* Derecha: acciones */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <GlobalSearch />
              <NotificationsBell />

              {/* Botón de tour siempre visible — con badge si no se ha completado */}
              <button
                onClick={resetOnboarding}
                aria-label={onboardingCompleted ? "Ver tutorial de nuevo" : "Ver tour de bienvenida"}
                title={onboardingCompleted ? "Ver tutorial de nuevo" : "Tour de bienvenida disponible"}
                className="hidden sm:inline-flex p-2 rounded-lg hover:bg-canvas transition-colors text-azul-oscuro relative"
              >
                <HelpCircle className="w-5 h-5" />
                {!onboardingCompleted && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-celeste text-azul-oscuro text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                    title="Tour disponible"
                  >
                    1
                  </span>
                )}
              </button>

              <UserMenu lastLogin={lastLoginLabel} />
            </div>
          </div>
        </header>

        <main id="main-content" className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <AgentInfoCard />
          <div className="mt-6">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Menú móvil lateral */}
      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={() => { setMobileMenuOpen(false); setLogoutConfirmOpen(true); }}
        availableCount={availableCount}
        pendingCount={pendingCount}
      />

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
      <KeyboardShortcutsTooltip />
    </div>
  );
}
