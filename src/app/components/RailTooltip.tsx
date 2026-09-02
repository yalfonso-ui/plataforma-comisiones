import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface RailTooltipProps {
  /** Texto que aparece en el tooltip. */
  label: string;
  /** Ref al elemento ancla (botón/link del sidebar). */
  anchorRef: RefObject<HTMLElement | null>;
  /** Variante visual. */
  variant?: "default" | "danger";
}

/**
 * Tooltip flotante portalizado a `document.body`.
 *
 * Por qué portal:
 *  - El `<aside>` del sidebar tiene `overflow-hidden` para evitar que su
 *    contenido se desborde durante la transición de ancho (w-16 ↔ w-72).
 *  - Un tooltip dentro del aside quedaría clippeado por ese overflow.
 *  - Renderizándolo en `document.body` con posición calculada vía
 *    `getBoundingClientRect`, escapamos del clipping.
 *
 * Visibilidad: aparece tras 250 ms de hover (UX similar a tooltips nativos)
 * y se oculta al salir del ancla, al hacer scroll/resize, o al cambiar de
 * breakpoint (resize dispara un re-check).
 */
export function RailTooltip({ label, anchorRef, variant = "default" }: RailTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const enterTimer = useRef<number | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const computePos = () => {
      const rect = anchor.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 8, // ml-2 = 8 px
      });
    };

    const onEnter = () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
      computePos();
      enterTimer.current = window.setTimeout(() => setVisible(true), 250);
    };
    const onLeave = () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
      enterTimer.current = window.setTimeout(() => setVisible(false), 80);
    };
    const onScroll = () => visible && setVisible(false);
    const onResize = () => {
      visible && setVisible(false);
      computePos();
    };

    anchor.addEventListener("mouseenter", onEnter);
    anchor.addEventListener("mouseleave", onLeave);
    anchor.addEventListener("focus", onEnter);
    anchor.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      if (enterTimer.current) window.clearTimeout(enterTimer.current);
      anchor.removeEventListener("mouseenter", onEnter);
      anchor.removeEventListener("mouseleave", onLeave);
      anchor.removeEventListener("focus", onEnter);
      anchor.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRef.current, label]);

  if (typeof document === "undefined") return null;

  const palette = variant === "danger" ? "bg-danger" : "bg-azul-oscuro";
  const arrowColor = variant === "danger" ? "border-r-danger" : "border-r-azul-oscuro";

  return createPortal(
    <span
      role="tooltip"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
      className={[
        "fixed z-[100] pointer-events-none",
        "whitespace-nowrap rounded-md text-white text-xs font-medium",
        "px-2.5 py-1.5 shadow-lg",
        palette,
        "transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent ${arrowColor}`}
      />
    </span>,
    document.body
  );
}
