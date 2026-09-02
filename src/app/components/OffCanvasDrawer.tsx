import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BORDER_DEFAULT } from "../utils/ui";

/** Ítem de segundo nivel en un submenú. */
export interface OffCanvasNavChild {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

/** Sección de nivel 1; puede tener hijos (acordeón) o ser enlace directo. */
export interface OffCanvasNavSection {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  children?: OffCanvasNavChild[];
}

interface OffCanvasDrawerProps {
  /** Estado controlado desde el padre. */
  isOpen: boolean;
  /** Callback para cerrar (clic en backdrop, back, ESC o click-outside). */
  onClose: () => void;
  /** Título de la cabecera (ej. "Tus titulaciones"). Si se omite, no se muestra. */
  title?: string;
  /** Lista de secciones de nivel 1. Si se omite y se pasan `children`, se ignora. */
  sections?: OffCanvasNavSection[];
  /** Slot opcional para inyectar contenido personalizado en el cuerpo del drawer. */
  children?: React.ReactNode;
  /** Slot opcional para el footer (debajo del nav). */
  footer?: React.ReactNode;
  /** Etiqueta ARIA del diálogo. Por defecto: "Menú de navegación". */
  ariaLabel?: string;
}

/**
 * Drawer / off-canvas lateral reutilizable (React + TS + Tailwind).
 *
 * Características:
 * - Flotante (fixed top-0 left-0 h-screen) con sombra y z-index alto.
 * - Transición suave desde el borde izquierdo (-translate-x-full / translate-x-0).
 * - Backdrop semitransparente que cierra el menú al hacer clic fuera.
 * - Cabecera con botón "Atrás" alineado arriba.
 * - Navegación de nivel 1 con submenús acordeón (chevron rotativo).
 * - Accesible: role="dialog", aria-modal, ESC, focus trap básico.
 * - Bloquea el scroll del body mientras está abierto.
 */
export function OffCanvasDrawer({
  isOpen,
  onClose,
  title,
  sections,
  children,
  footer,
  ariaLabel = "Menú de navegación",
}: OffCanvasDrawerProps) {
  const asideRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Set de secciones expandidas (acordeón multi-abierto).
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Cierra con ESC y bloquea scroll del body.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Bloqueo de scroll mientras el drawer está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Gestión de foco al abrir/cerrar.
  useEffect(() => {
    if (isOpen) {
      // Guardar el elemento con foco previo y enfocar el drawer.
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Esperar al siguiente tick para asegurar que el aside ya está montado.
      const t = window.setTimeout(() => {
        asideRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    } else {
      // Restaurar foco al cerrar.
      previouslyFocused.current?.focus?.();
    }
  }, [isOpen]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      {/* Backdrop semitransparente */}
      <button
        type="button"
        aria-label="Cerrar menú"
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer lateral */}
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`fixed top-0 left-0 h-screen w-80 max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera con botón Atrás */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-base bg-white sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Atrás"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-azul-oscuro hover:bg-canvas transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Atrás</span>
          </button>
          {title && (
            <span className="ml-auto text-sm font-semibold text-azul-oscuro truncate">
              {title}
            </span>
          )}
        </div>

        {/* Contenido: prioriza children inyectado; si no, pinta sections acordeón */}
        {children ? (
          <div className="flex-1 overflow-y-auto">{children}</div>
        ) : (
          <nav className="flex-1 overflow-y-auto py-2" aria-label="Navegación principal">
            <ul className="space-y-0.5 px-2">
              {(sections ?? []).map((section) => {
                const hasChildren = Array.isArray(section.children) && section.children.length > 0;
                const isExpanded = expanded.has(section.id);
                const Icon = section.icon;

                // Sección sin hijos → enlace directo.
                if (!hasChildren) {
                  const Tag: keyof JSX.IntrinsicElements = section.href ? "a" : "button";
                  const itemProps = section.href
                    ? { href: section.href }
                    : { type: "button" as const };
                  return (
                    <li key={section.id}>
                      <Tag
                        {...itemProps}
                        onClick={() => {
                          section.onClick?.();
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-azul-oscuro hover:bg-canvas transition-colors text-sm text-left"
                      >
                        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                        <span className="flex-1">{section.label}</span>
                      </Tag>
                    </li>
                  );
                }

                // Sección con hijos → acordeón.
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(section.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`section-${section.id}`}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-azul-oscuro hover:bg-canvas transition-colors text-sm"
                    >
                      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                      <span className="flex-1 text-left">{section.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Submenú desplegable con sangría */}
                    <div
                      id={`section-${section.id}`}
                      role="region"
                      aria-label={`Submenú ${section.label}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="pl-4 pr-2 pb-1 space-y-0.5">
                          {section.children!.map((child) => (
                            <li key={child.id}>
                              <a
                                href={child.href ?? "#"}
                                onClick={(e) => {
                                  if (!child.href) e.preventDefault();
                                  child.onClick?.();
                                  onClose();
                                }}
                                className="block px-3 py-2 rounded-lg text-text-secondary hover:bg-canvas hover:text-azul-oscuro transition-colors text-sm"
                              >
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Footer opcional (no se monta si no se pasa) */}
        {footer && (
          <div className={`border-t ${BORDER_DEFAULT} p-3 space-y-1 bg-white`}>
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
