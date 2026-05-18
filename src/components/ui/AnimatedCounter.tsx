"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type AnimatedCounterProps = {
  to: number;
  /** Tiempo de animación en segundos. */
  duration?: number;
  /** Decimales a mostrar (e.g. 1 para "4.9"). */
  decimals?: number;
  /** Locale para el formato numérico. */
  locale?: string;
  /** Prefijo opcional (e.g. "+"). */
  prefix?: string;
  /** Sufijo opcional (e.g. "%"). */
  suffix?: string;
  className?: string;
};

/**
 * Contador animado que arranca cuando entra al viewport (no en mount).
 * Respeta `prefers-reduced-motion`: muestra el valor final sin animar.
 * Se anima una sola vez (`once: true`).
 */
export function AnimatedCounter({
  to,
  duration = 1.8,
  decimals = 0,
  locale = "es",
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimated(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  // El valor mostrado se deriva en render para evitar setState innecesarios en effect.
  const displayed = reduce ? to : animated;
  const formatted = displayed.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
