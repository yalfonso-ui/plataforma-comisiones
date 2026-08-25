import { Keyboard } from "lucide-react";
import { useState } from "react";

export function KeyboardShortcutsTooltip() {
  const [show, setShow] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="p-3 bg-[#00184C] text-white rounded-full shadow-lg hover:bg-[#00184C]/90 transition-colors"
        title="Atajos de teclado"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {show && (
        <div className="absolute bottom-16 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <h4 className="text-sm font-semibold text-[#00184C] mb-3">Atajos de teclado</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Buscar</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">/</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cerrar modal</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Esc</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Limpiar búsqueda</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Esc</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
