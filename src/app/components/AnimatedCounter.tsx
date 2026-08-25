import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

/**
 * Contador animado que va del valor previo al nuevo valor numérico.
 * Resiliente a entradas con/sin números y a decimales.
 * Si el parseo falla, devuelve el texto plano sin animación.
 */
export function AnimatedCounter({ value, duration = 700 }: AnimatedCounterProps) {
  // Parsing defensivo
  const numericPart = parseNumeric(value);
  const [display, setDisplay] = useState<number>(numericPart ?? 0);
  const previousRef = useRef<number>(numericPart ?? 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (numericPart === null) return;
    const start = previousRef.current;
    const end = numericPart;
    if (start === end) return;

    const startTime = performance.now();
    let frameId = 0;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (t < 1) frameId = requestAnimationFrame(animate);
      else previousRef.current = end;
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [numericPart, duration]);

  // Si no hay número o no se ha montado, fallback al texto
  if (numericPart === null) return <>{value ?? ""}</>;

  // Evitar mismatch de hidratación mostrando el valor estático en el primer render
  if (!mounted) return <>{value ?? ""}</>;

  const match = value.match(/-?\d[\d,.]*/);
  const prefix = match && typeof match.index === "number" ? value.slice(0, match.index) : "";
  const suffix = match && typeof match.index === "number"
    ? value.slice(match.index + match[0].length)
    : "";
  const decimals = match && match[0].includes(".")
    ? Math.min(20, Math.max(0, match[0].split(".")[1]?.length ?? 0))
    : 0;

  let formatted: string;
  try {
    formatted = display.toLocaleString("es-MX", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return <>{value}</>;
  }

  return (
    <>
      {prefix}
      {formatted}
      {suffix}
    </>
  );
}

function parseNumeric(value: string | undefined | null): number | null {
  if (typeof value !== "string" || !value) return null;
  const match = value.match(/-?\d[\d,.]*/);
  if (!match) return null;
  const cleaned = match[0].replace(/,/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}
