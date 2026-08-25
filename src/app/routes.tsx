import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Login } from "./components/Login";
import { Resumen } from "./components/Resumen";
import { Cartera } from "./components/Cartera";
import { Facturar } from "./components/Facturar";
import { Historial } from "./components/Historial";
import { RequireAuth } from "./components/RequireAuth";
import { ProfilePage } from "./components/ProfilePage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ScrollToTop } from "./components/ScrollToTop";

/**
 * Layout raíz: incluye ScrollToTop DENTRO del contexto del router
 * para que useLocation() funcione correctamente.
 * 
 * FIX: Antes ScrollToTop estaba como hermano de <RouterProvider>,
 * lo que causaba un crash porque useLocation() requiere estar
 * dentro del árbol del router.
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
          { path: "cartera", Component: Cartera },
          { path: "facturar", Component: Facturar },
          { path: "historial", Component: Historial },
          { path: "perfil", Component: ProfilePage },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
