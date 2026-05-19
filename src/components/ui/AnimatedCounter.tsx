"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

// Mobile: el counter animado consume main thread y sube el TBT mobile.
// El wow factor en pantalla pequeña es bajo (los stats ocupan menos viewport).
// En mobile mostramos el valor final directo.
//
// `useSyncExternalStore` evita SSR mismatch y el warning del React Compiler
// sobre setState en useEffect.
const MQ = "(min-width: 1024px)";
function subscribeMQ(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getMobileSnapshot() {
  return !window.matchMedia(MQ).matches;
}
function getServerSnapshot() {
  // SSR: asumimos desktop (no skipAnimation). El cliente corrige post-mount.
  return false;
}

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
  const skipAnimation = useSyncExternalStore(
    subscribeMQ,
    getMobileSnapshot,
    getServerSnapshot
  );
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!inView || reduce || skipAnimation) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimated(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, skipAnimation, to, duration]);

  // El valor mostrado se deriva en render para evitar setState innecesarios en effect.
  const displayed = reduce || skipAnimation ? to : animated;
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
