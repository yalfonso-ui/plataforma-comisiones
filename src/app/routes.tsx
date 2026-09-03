import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Login } from "./components/Login";
import { Resumen } from "./components/Resumen";
import { MiCartera } from "./components/MiCartera";
import { CarteraPage } from "./components/cartera/CarteraPage";
import { FacturarPage } from "./components/facturar/FacturarPage";
import { Historial } from "./components/Historial";
import { RequireAuth } from "./components/RequireAuth";
import { ProfilePage } from "./components/ProfilePage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ScrollToTop } from "./components/ScrollToTop";
import { RequireRole } from "./components/RequireRole";
import { ComisionesPage } from "./components/comisiones/ComisionesPage";
import { AgenciasPage } from "./components/admin/AgenciasPage";
import { UsuariosPage } from "./components/admin/UsuariosPage";
import { ConfigPage } from "./components/admin/ConfigPage";
import { useAppStore } from "./store/appStore";
import { can } from "./auth/permissions";

/**
 * Wrapper que decide qué vista mostrar en /cartera según el rol:
 * - comercial  → MiCartera (confirmar pagos, ver vouchers propios)
 * - cartera    → CarteraPage (aprobar facturas radicadas)
 * - comisiones, super_admin → CarteraPage (read-only de aprobaciones)
 */
function CarteraRouter() {
  const role = useAppStore((s) => s.user?.rol);
  if (role === "cartera" || role === "comisiones" || role === "super_admin") {
    return <CarteraPage />;
  }
  return <MiCartera />;
}

/**
 * Guard inline que admite varios permisos (OR lógico).
 * Útil para rutas que deben ser accesibles por varios roles con
 * permisos distintos. Si ninguno coincide, redirige a /resumen.
 *
 * Reutiliza RequireRole pero cambiando a un redirect seguro.
 */
function RequireAnyRole({ permissions, children }: { permissions: string[]; children: React.ReactNode }) {
  const role = useAppStore((s) => s.user?.rol);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !permissions.some((p) => can(p as never, role))) {
    return <Navigate to="/resumen" replace />;
  }
  return <>{children}</>;
}

/**
 * Catch-all inteligente: cualquier ruta no existente redirige al login
 * si no hay sesión o invitación validada. Si ambos están OK,
 * muestra el NotFoundPage con accesos directos al dashboard. Esto
 * evita que rutas desconocidas en GitHub Pages (que sirven
 * 404.html → index.html) queden atrapadas.
 */
function NotFoundRouter() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();
  // Importante: la doble validación la hace NotFoundPage internamente;
  // aquí solo necesitamos asegurar que cualquier ruta no existente
  // NO renderice contenido si el usuario no pasó por el gate.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <NotFoundPage />;
}

/**
 * Layout raíz: incluye ScrollToTop DENTRO del contexto del router
 * para que useLocation() funcione correctamente.
 */
function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", Component: Login },
      {
        path: "/",
        Component: () => (
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Navigate to="/resumen" replace /> },
          { path: "resumen", Component: Resumen },
          // /cartera unificado: accesible para comercial (ver vouchers)
          // y para cartera/comisiones/admin (aprobar facturas).
          { path: "cartera", element: <RequireAnyRole permissions={["cartera:view", "facturar:view_own"]}><CarteraRouter /></RequireAnyRole> },
          // /mi-cartera redirige a /cartera — compat con deep-links antiguos.
          { path: "mi-cartera", element: <Navigate to="/cartera" replace /> },
          { path: "facturar", element: <RequireRole permission="facturar:create"><FacturarPage /></RequireRole> },
          { path: "historial", Component: Historial },
          { path: "perfil", Component: ProfilePage },
          { path: "comisiones", element: <RequireRole permission="comisiones:view"><ComisionesPage /></RequireRole> },
          { path: "agencias", element: <RequireRole permission="agencias:manage"><AgenciasPage /></RequireRole> },
          { path: "usuarios", element: <RequireRole permission="usuarios:manage"><UsuariosPage /></RequireRole> },
          { path: "config", element: <RequireRole permission="config:manage"><ConfigPage /></RequireRole> },
        ],
      },
      { path: "*", Component: NotFoundRouter },
    ],
  },
]);
