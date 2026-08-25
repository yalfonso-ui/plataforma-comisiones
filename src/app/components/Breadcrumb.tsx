import { Link, useLocation, useNavigate } from "react-router";
import { ChevronRight, ArrowLeft, Home } from "lucide-react";
import { TEXT_SECONDARY, BG_CANVAS } from "../utils/ui";

interface Crumb {
  label: string;
  to?: string;
}

const ROUTE_LABELS: Record<string, Crumb> = {
  "/resumen": { label: "Resumen" },
  "/cartera": { label: "Cartera" },
  "/facturar": { label: "Facturar" },
  "/historial": { label: "Historial" },
  "/perfil": { label: "Mi perfil" },
};

export function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "Inicio", to: "/resumen" }];

  let acc = "";
  for (const seg of segments) {
    acc += "/" + seg;
    const label = ROUTE_LABELS[acc]?.label ?? seg;
    crumbs.push({ label, to: acc });
  }

  // Solo mostrar si hay profundidad (sub-ruta) o si la URL tiene query params
  // En el home raíz no se muestra.
  const hasDepth = crumbs.length > 2 || location.search.length > 0;
  if (!hasDepth) return null;

  const canGoBack = location.key !== "default";

  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className={`p-1.5 rounded-md ${BG_CANVAS} hover:bg-border-base transition-colors ${TEXT_SECONDARY}`}
            aria-label="Volver a la página anterior"
            title="Volver"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <ol className="flex items-center gap-1.5 text-sm flex-wrap">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${crumb.to ?? crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i === 0 && (
                  <Home className={`w-3.5 h-3.5 ${TEXT_SECONDARY}`} aria-hidden="true" />
                )}
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className={`${TEXT_SECONDARY} hover:text-azul-oscuro transition-colors flex items-center gap-1`}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-azul-oscuro font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight className={`w-3.5 h-3.5 ${TEXT_SECONDARY} opacity-50`} aria-hidden="true" />
                )}
              </li>
            );
          })}
          {location.search && (
            <span className={`text-[10px] ${TEXT_SECONDARY} opacity-70 ml-2`}>
              {location.search}
            </span>
          )}
        </ol>
      </div>
    </nav>
  );
}
