import { Navigate, useLocation } from "react-router";
import { useAppStore } from "../store/appStore";
import { ReactNode } from "react";
import { BG_CANVAS } from "../utils/ui";

interface Props {
  children: ReactNode;
}

/**
 * Protege una ruta: si no hay sesión, redirige a /login guardando
 * la URL intentada en `state.from` para retornar al usuario.
 *
 * Mientras se rehidrata el estado persistido en `localStorage`,
 * muestra un loader mínimo (no pantalla blanca).
 */
export function RequireAuth({ children }: Props) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();

  // Estado de hidratación: zustand/persist rehidrata en el primer paint
  if (isAuthenticated === undefined || isAuthenticated === null) {
    return (
      <div className={`min-h-screen ${BG_CANVAS} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-celeste border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-azul-oscuro/70 font-medium">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
