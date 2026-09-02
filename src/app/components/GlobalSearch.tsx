import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, FileText, Receipt, User, X, CornerDownLeft, ArrowRight, Clock, Hash, Zap, ChevronUp } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { TEXT_SECONDARY, BORDER_DEFAULT, BG_CANVAS } from "../utils/ui";

type ResultType = "voucher" | "factura" | "usuario" | "reciente";

interface Result {
  id: string;
  label: string;
  sub: string;
  type: ResultType;
  href: string;
  meta?: string;
  /** Etiqueta visible del grupo */
  groupLabel: string;
}

const RECENT_KEY = "continental:recent-searches";
const MAX_RECENTS = 5;

function getRecents(): string[] {
  // Acceso defensivo a localStorage: puede lanzar en modo privado o SSR
  let raw: string | null = null;
  try {
    raw = typeof localStorage !== "undefined" ? localStorage.getItem(RECENT_KEY) : null;
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  if (!q.trim()) return;
  try {
    const list = getRecents().filter((x) => x !== q);
    list.unshift(q);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
    }
  } catch {
    /* ignore storage errors */
  }
}

function clearRecents() {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Resalta el fragmento que matchea en el texto (alto contraste: celeste soft + azul oscuro). */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-celeste-subtle text-azul-oscuro font-semibold rounded px-0.5">
        {match}
      </mark>
      {after}
    </>
  );
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [recents, setRecents] = useState<string[]>(getRecents);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const operations = useAppStore((s) => s.operations);
  const invoices = useAppStore((s) => s.invoices);
  const user = useAppStore((s) => s.user);

  // Cmd/Ctrl+K or "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
      if (e.key === "/" && !open) {
        const target = e.target as HTMLElement;
        const isEditable =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results: Result[] = useMemo(() => {
    // Vacío: secciones recientes + acciones rápidas
    if (!query.trim()) {
      const out: Result[] = [];

      if (recents.length > 0) {
        recents.forEach((q) => {
          out.push({
            id: `recent-${q}`,
            label: q,
            sub: "Búsqueda reciente",
            type: "reciente",
            href: "/cartera",
            groupLabel: "Recientes",
          });
        });
      }

      const quick: Result[] = [
        { id: "act-resumen", label: "Ir a Resumen", sub: "Página principal", type: "usuario", href: "/resumen", groupLabel: "Acciones rápidas" },
        { id: "act-cartera", label: "Ir a Cartera", sub: "Tus comisiones o aprobaciones según tu rol", type: "usuario", href: "/cartera", groupLabel: "Acciones rápidas" },
        { id: "act-facturar", label: "Ir a Facturar", sub: "Crear factura", type: "usuario", href: "/facturar", groupLabel: "Acciones rápidas" },
        { id: "act-historial", label: "Ir a Historial", sub: "Facturas enviadas", type: "usuario", href: "/historial", groupLabel: "Acciones rápidas" },
        { id: "act-perfil", label: "Mi perfil", sub: "Datos personales y bancarios", type: "usuario", href: "/perfil", groupLabel: "Acciones rápidas" },
      ];
      out.push(...quick);
      return out;
    }

    const q = query.toLowerCase();
    const matches: Result[] = [];

    for (const op of operations) {
      if (op.voucher.toLowerCase().includes(q)) {
        matches.push({
          id: `op-${op.id}`,
          label: op.voucher,
          sub: `${op.plan} • ${op.fecha}`,
          type: "voucher",
          href: "/cartera",
          meta: `${op.status} • $${op.valor.toLocaleString("es-MX")}`,
          groupLabel: "Vouchers",
        });
      }
    }

    for (const inv of invoices) {
      if (
        inv.id.toLowerCase().includes(q) ||
        inv.vouchers.some((v) => v.toLowerCase().includes(q))
      ) {
        matches.push({
          id: `inv-${inv.id}`,
          label: inv.id,
          sub:
            inv.vouchers.length === 1
              ? inv.vouchers[0]
              : `${inv.vouchers.length} vouchers • ${inv.fecha}`,
          type: "factura",
          href: "/historial",
          meta: `${inv.status} • $${inv.totalComision.toLocaleString("es-MX")}`,
          groupLabel: "Facturas",
        });
      }
    }

    if (
      user?.name?.toLowerCase().includes(q) ||
      user?.email?.toLowerCase().includes(q)
    ) {
      matches.push({
        id: "user-self",
        label: user?.name ?? "Mi cuenta",
        sub: user?.email ?? "",
        type: "usuario",
        href: "/perfil",
        groupLabel: "Tu cuenta",
      });
    }

    return matches.slice(0, 30);
  }, [query, operations, invoices, user, recents]);

  // Reset active cuando cambian los resultados
  useEffect(() => {
    setActiveIdx(0);
  }, [query, results.length]);

  const handleEnter = (r: Result | undefined) => {
    if (!r) return;
    pushRecent(query);
    setRecents(getRecents());
    navigate(r.href);
    setOpen(false);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleEnter(results[activeIdx]);
    }
  };

  // Trigger button (visible cuando el buscador está cerrado)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`hidden md:flex w-full items-center gap-2 px-3 py-2 rounded-lg border border-border-base bg-canvas text-azul-oscuro hover:bg-white hover:border-celeste transition-colors text-sm cursor-text`}
        aria-label="Abrir búsqueda global (Cmd K)"
        title="Búsqueda global (⌘K)"
      >
        <Search className="w-4 h-4 text-text-secondary flex-shrink-0" />
        <span className="text-text-secondary flex-1 text-left">Buscar voucher, factura, sección…</span>
        <kbd className="bg-white text-text-secondary px-1.5 py-0.5 rounded text-[10px] font-mono border border-border-base flex-shrink-0">
          ⌘K
        </kbd>
      </button>
    );
  }

  const iconFor = (type: ResultType) => {
    if (type === "voucher") return <FileText className="w-4 h-4 text-info" />;
    if (type === "factura") return <Receipt className="w-4 h-4 text-success" />;
    if (type === "reciente") return <Clock className="w-4 h-4 text-text-secondary" />;
    return <User className="w-4 h-4 text-celeste" />;
  };

  // Agrupar resultados por groupLabel, conservando el orden
  const groups: { label: string; items: (Result & { flatIdx: number })[] }[] = [];
  results.forEach((r, i) => {
    const last = groups[groups.length - 1];
    if (!last || last.label !== r.groupLabel) {
      groups.push({ label: r.groupLabel, items: [{ ...r, flatIdx: i }] });
    } else {
      last.items.push({ ...r, flatIdx: i });
    }
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda global"
    >
      <button
        aria-label="Cerrar búsqueda"
        className="absolute inset-0 bg-azul-oscuro/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
      />

      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl ${BORDER_DEFAULT} border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200`}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base">
          <Search className="w-5 h-5 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Buscar voucher, factura, sección…"
            className="flex-1 text-base text-azul-oscuro placeholder:text-text-secondary outline-none bg-transparent"
            aria-label="Buscar"
            aria-controls="global-search-results"
            aria-activedescendant={results[activeIdx]?.id}
          />
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar buscador"
            className={`p-1 rounded ${TEXT_SECONDARY} hover:bg-canvas`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resultados agrupados */}
        <div
          id="global-search-results"
          role="listbox"
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {results.length === 0 ? (
            <div className={`px-5 py-10 text-center ${TEXT_SECONDARY} text-sm`}>
              Sin resultados para &quot;{query}&quot;
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="mb-2">
                <div className={`px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${TEXT_SECONDARY} opacity-70`}>
                  {g.label}
                </div>
                {g.items.map((r) => {
                  const isActive = r.flatIdx === activeIdx;
                  return (
                    <button
                      key={r.id}
                      role="option"
                      aria-selected={isActive}
                      id={r.id}
                      onMouseEnter={() => setActiveIdx(r.flatIdx)}
                      onClick={() => handleEnter(r)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        isActive ? "bg-celeste-soft" : "hover:bg-canvas"
                      }`}
                    >
                      <div className="w-8 h-8 bg-canvas rounded-lg flex items-center justify-center flex-shrink-0">
                        {iconFor(r.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-azul-oscuro truncate">
                          <Highlight text={r.label} query={query} />
                        </p>
                        <p className={`text-xs ${TEXT_SECONDARY} truncate`}>
                          <Highlight text={r.sub} query={query} />
                        </p>
                      </div>
                      {r.meta && (
                        <span className={`text-xs ${TEXT_SECONDARY} hidden sm:inline`}>
                          {r.meta}
                        </span>
                      )}
                      {isActive && (
                        <ChevronUp className="w-4 h-4 text-azul-oscuro rotate-90" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}

          {/* Limpiar recientes — solo cuando el query está vacío y hay recientes */}
          {!query.trim() && recents.length > 0 && (
            <div className={`border-t ${BORDER_DEFAULT} mt-2 pt-2`}>
              <button
                onClick={() => { clearRecents(); setRecents([]); }}
                className={`w-full text-left px-5 py-2 text-xs ${TEXT_SECONDARY} hover:text-danger transition-colors inline-flex items-center gap-2`}
              >
                <X className="w-3 h-3" />
                Borrar búsquedas recientes
              </button>
            </div>
          )}
        </div>

        {/* Footer con atajos */}
        <div className={`px-5 py-3 border-t ${BORDER_DEFAULT} ${BG_CANVAS} flex items-center gap-4 text-[11px] ${TEXT_SECONDARY} flex-wrap`}>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded font-mono">↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded font-mono">↵</kbd>
            seleccionar
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded font-mono">⌘K</kbd>
            reabrir
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <CornerDownLeft className="w-3 h-3" />
            <kbd className="px-1.5 py-0.5 bg-white border border-border-base rounded font-mono">esc</kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
