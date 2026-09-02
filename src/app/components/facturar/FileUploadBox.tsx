// ============================================================
// File Upload Box reutilizable — usado por StepArchivos
// ============================================================

import { useRef, useState } from "react";
import { Upload, FileCheck, X, AlertCircle } from "lucide-react";
import { TEXT_SECONDARY, BORDER_DEFAULT } from "../../utils/ui";

interface FileUploadBoxProps {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

export function FileUploadBox({ label, accept, file, onFileChange, error }: FileUploadBoxProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (selectedFile: File): string | null => {
    // Validar extensión
    const ext = selectedFile.name.toLowerCase().split(".").pop() ?? "";
    const expected = accept.replace(/\./g, "").split(",").map(s => s.trim());
    if (!expected.includes(ext)) {
      return `El archivo debe ser de tipo ${expected.map(e => e.toUpperCase()).join(" o ")}`;
    }
    // Validar tamaño (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      return "El archivo no debe superar los 10 MB";
    }
    return null;
  };

  const handleSelect = (selectedFile?: File) => {
    if (!selectedFile) return;
    const err = validate(selectedFile);
    if (err) {
      setLocalError(err);
      onFileChange(null);
      return;
    }
    setLocalError(null);
    onFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleSelect(droppedFile);
  };

  const errorMessage = error ?? localError;

  return (
    <div>
      <label className="block text-sm font-medium text-azul-oscuro mb-2">
        {label} <span className="text-danger ml-1">*</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className="relative"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleSelect(e.target.files?.[0])}
          className="hidden"
          aria-label={`Subir ${label}`}
        />
        <label
          htmlFor={`upload-${label}`}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            errorMessage
              ? "border-danger bg-danger-soft"
              : isDragging
                ? "border-celeste bg-celeste-soft"
                : file
                  ? "border-success bg-success-soft"
                  : `${BORDER_DEFAULT} border bg-canvas hover:border-celeste`
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 p-4 relative w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFileChange(null);
                  setLocalError(null);
                }}
                aria-label={`Eliminar ${label}`}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-canvas border border-border-base"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
              <FileCheck className="w-10 h-10 text-success" />
              <span className="text-sm font-medium text-azul-oscuro text-center px-8 break-all">
                {file.name}
              </span>
              <span className={`text-xs ${TEXT_SECONDARY}`}>
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className={`w-10 h-10 ${errorMessage ? "text-danger" : "text-text-secondary"}`} />
              <span className="text-sm text-azul-oscuro font-medium">
                Arrastra o haz clic para subir
              </span>
              <span className={`text-xs ${TEXT_SECONDARY}`}>
                {accept.toUpperCase()} · Máximo 10 MB
              </span>
            </div>
          )}
        </label>
      </div>

      {errorMessage && (
        <p role="alert" className="text-danger text-xs mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
