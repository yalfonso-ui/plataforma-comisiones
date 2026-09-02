import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Atajos de teclado globales de la app.
 *
 * Navegación:
 *   g r → /resumen
 *   g c / g k / g v → /cartera (comercial: vouchers / rol Cartera: aprobaciones)
 *   g f → /facturar
 *   g h → /historial
 *   g p → /perfil
 *
 * Búsqueda:
 *   Cmd/Ctrl + K o "/" → abre GlobalSearch
 *   ?                    → toggle panel de atajos
 *
 * Los atajos se desactivan si el foco está en un input/textarea/contenteditable
 * para no interferir con la escritura del usuario.
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let lastG = 0;

    const isEditableTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const handler = (e: KeyboardEvent) => {
      // Permitir Cmd/Ctrl+K siempre (es atajo global del browser para búsqueda)
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        // No prevenir si está en input — deja que el usuario lo maneje
        return;
      }
      // Permitir "?" también — atajo no usado por ahora
      if (e.key === "?") {
        return;
      }

      // Bloquear cualquier atajo en inputs editables
      if (isEditableTarget(e.target)) return;

      // Escape para cerrar modales — la lógica la maneja cada componente
      if (e.key === "Escape") return;

      const now = Date.now();

      // Secuencia "g + letra"
      if (e.key === "g") {
        lastG = now;
        return;
      }

      // Si la ventana desde la "g" es corta, interpretamos la siguiente tecla
      if (lastG > 0 && now - lastG < 800) {
        switch (e.key.toLowerCase()) {
          case "r":
            e.preventDefault();
            navigate("/resumen");
            break;
          case "v":
            // Alias de "c" — algunos usuarios lo buscan como "vouchers"
            e.preventDefault();
            navigate("/cartera");
            break;
          case "k":
            e.preventDefault();
            navigate("/cartera");
            break;
          case "f":
            e.preventDefault();
            navigate("/facturar");
            break;
          case "h":
            e.preventDefault();
            navigate("/historial");
            break;
          case "p":
            e.preventDefault();
            navigate("/perfil");
            break;
        }
        lastG = 0;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
}
