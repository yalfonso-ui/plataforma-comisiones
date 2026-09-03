import { Link, Navigate, useLocation } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";
import { BTN_PRIMARY, BTN_SECONDARY, BG_CANVAS, TEXT_SECONDARY } from "../utils/ui";
import { useAppStore } from "../store/appStore";

export function NotFoundPage() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Si está autenticado, mostramos el 404 friendly con accesos directos.
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Marca visual */}
        <div className="relative inline-block mb-6">
          <div className="text-9xl font-bold text-azul-oscuro leading-none">404</div>
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-celeste text-azul-oscuro text-[10px] font-bold uppercase tracking-wide rounded rotate-12">
            perdido
          </div>
        </div>

        <h2 className="text-2xl font-bold text-azul-oscuro mb-3">Página no encontrada</h2>
        <p className={`${TEXT_SECONDARY} mb-2`}>
          La ruta que intentas visitar no existe o fue movida.
        </p>
        <p className={`text-sm ${TEXT_SECONDARY} opacity-70 mb-8`}>
          Verifica la URL o utiliza los siguientes accesos directos:
        </p>

        {/* Acciones primarias */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <Link
            to="/resumen"
            className={`${BTN_PRIMARY} px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2`}
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className={`${BTN_SECONDARY} px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2`}
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>

        {/* Sugerencias */}
        <div className={`${BG_CANVAS} rounded-xl p-5 text-left`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${TEXT_SECONDARY} mb-3 inline-flex items-center gap-1.5`}>
            <Search className="w-3 h-3" />
            O intenta
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/cartera?status=pendiente" className={`text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}>
              Revisar pendientes →
            </Link>
            <Link to="/facturar" className={`text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}>
              Crear factura →
            </Link>
            <Link to="/historial" className={`text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}>
              Ver historial →
            </Link>
            <Link to="/perfil" className={`text-sm ${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors`}>
              Mi perfil →
            </Link>
          </div>
        </div>

        <p className={`text-xs ${TEXT_SECONDARY} opacity-60 mt-6`}>
          Tip: pulsa <kbd className="px-1.5 py-0.5 bg-canvas border border-border-base rounded font-mono text-[10px]">Cmd + K</kbd> para buscar
        </p>
      </div>
    </div>
  );
}
