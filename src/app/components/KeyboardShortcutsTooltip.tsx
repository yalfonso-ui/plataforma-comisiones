import { Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

interface Shortcut {
  keys: string[];
  description: string;
  context?: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["g", "r"], description: "Ir a Resumen", context: "Global" },
  { keys: ["g", "c"], description: "Ir a Cartera", context: "Global" },
  { keys: ["g", "f"], description: "Ir a Facturar", context: "Global" },
  { keys: ["g", "h"], description: "Ir a Historial", context: "Global" },
  { keys: ["g", "p"], description: "Ir a Mi perfil", context: "Global" },
  { keys: ["⌘", "K"], description: "Abrir buscador global", context: "Global" },
  { keys: ["/"], description: "Abrir buscador global", context: "Sin foco en input" },
  { keys: ["/"], description: "Enfocar buscador", context: "En Cartera" },
  { keys: ["?"], description: "Mostrar este panel", context: "Global" },
  { keys: ["Esc"], description: "Cerrar modal / menú / buscador", context: "Cualquier modal abierto" },
];

export function KeyboardShortcutsTooltip() {
  const [pin, setPin] = useState(false);
  const [hover, setHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle con "?" cuando NO hay foco en input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "?") {
        const target = e.target as HTMLElement;
        const isEditable =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          setPin((p) => !p);
        }
      }
      if (e.key === "Escape" && pin) setPin(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pin]);

  const visible = pin || hover;

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40 print:hidden">
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setPin((p) => !p)}
        aria-label="Ver atajos de teclado"
        aria-expanded={visible}
        className="p-3 bg-azul-oscuro text-white rounded-full shadow-lg hover:bg-azul-oscuro-hover transition-colors"
        title="Atajos de teclado (pulsa ?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {visible && (
        <div
          role="dialog"
          aria-label="Atajos de teclado"
          className={`absolute bottom-16 right-0 w-80 bg-white border ${BORDER_DEFAULT} rounded-xl shadow-xl p-4 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2 border-b border-border-base">
            <h4 className="text-sm font-semibold text-azul-oscuro">Atajos de teclado</h4>
            {pin && (
              <span className="text-[10px] text-celeste uppercase tracking-wide font-semibold bg-celeste-soft px-2 py-0.5 rounded">
                Pin
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {shortcuts.map((s, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between items-center gap-2">
                  <span className={`flex-1 ${TEXT_SECONDARY}`}>{s.description}</span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    {s.keys.map((k, j) => (
                      <kbd
                        key={j}
                        className={`px-2 py-0.5 ${BG_CANVAS} border ${BORDER_DEFAULT} rounded ${TEXT_SECONDARY} font-mono text-[11px] min-w-[20px] text-center`}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
                {s.context && (
                  <p className={`text-[10px] ${TEXT_SECONDARY} opacity-70 text-right italic`}>
                    {s.context}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className={`mt-3 pt-3 border-t border-border-base text-[10px] ${TEXT_SECONDARY} opacity-70`}>
            Pulsa <kbd className={`px-1 font-mono ${BG_CANVAS} border ${BORDER_DEFAULT} rounded`}>?</kbd> para abrir/cerrar este panel.
          </div>
        </div>
      )}
    </div>
  );
}
