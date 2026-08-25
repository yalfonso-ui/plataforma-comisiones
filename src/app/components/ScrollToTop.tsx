import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Restaura la posición de scroll al tope en cada navegación.
 *
 * Ubicación: dentro del <BrowserRouter>. No renderiza UI.
 *
 * Para preservar scroll en navegación "atrás/adelante" el navegador lo maneja nativo,
 * pero normalmente preferimos reset visual al cambiar de sección.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Pequeño retardo para permitir que el nuevo componente pinte antes del scroll
    const id = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
