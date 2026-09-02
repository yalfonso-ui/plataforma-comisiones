// ============================================================
// Hook + util para hacer scroll asistido y resaltar elementos
// cuando el usuario necesita atención en una sección específica.
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook que expone `scrollTo(id)` y un trigger para animar
 * un elemento con la clase CSS `.scroll-highlight`.
 *
 * Devuelve:
 *  - registerRef(id) → para que el padre propague al elemento.
 *  - scrollTo(id) → hace scroll suave + dispara pulse.
 *  - pulseTrigger → número que cambia cada vez que se dispara (para useEffect hijos).
 */
export function useScrollHighlight() {
  const [pulseTrigger, setPulseTrigger] = useState(0);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Scroll suave
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Disparar pulse via data-attribute + class toggle
    el.classList.remove("scroll-highlight");
    // Forzar reflow para reiniciar animación
    void el.offsetWidth;
    el.classList.add("scroll-highlight");

    // Disparar contador para que useEffects hijos puedan reaccionar
    setPulseTrigger(prev => prev + 1);

    // Mover foco al elemento si es focusable (con tabindex=-1 para no romper tab order)
    const focusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      // pequeño delay para que el scroll termine antes de mover foco
      setTimeout(() => focusable.focus({ preventScroll: true }), 350);
    }
  }, []);

  return { scrollTo, pulseTrigger };
}
