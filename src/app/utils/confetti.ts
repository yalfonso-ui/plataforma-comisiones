import confetti from "canvas-confetti";

/**
 * Dispara una animación de confeti sutil desde el centro-inferior de la pantalla.
 * Ideal para confirmar acciones exitosas (pago confirmado, factura enviada).
 */
export function fireSuccessConfetti() {
  const duration = 1200;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.6, 0.9) },
      colors: ["#00184C", "#43D3FF", "#F9D35A"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.6, 0.9) },
      colors: ["#00184C", "#43D3FF", "#F9D35A"],
    });
  }, 250);
}
