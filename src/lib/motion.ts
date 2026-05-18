/**
 * Variants compartidas de Framer Motion (paquete `motion`).
 * Cada componente las puede importar para mantener consistencia de timing y curva.
 */
import type { Variants } from "motion/react";

const EASE_BRAND = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_BRAND },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_BRAND } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const lift: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: {
    y: -4,
    boxShadow: "0 12px 28px oklch(65% 0.096 72 / 0.18)",
    transition: { duration: 0.35, ease: EASE_BRAND },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_BRAND } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.4, ease: EASE_BRAND } },
};

export const viewport = { once: true, amount: 0.2 } as const;
