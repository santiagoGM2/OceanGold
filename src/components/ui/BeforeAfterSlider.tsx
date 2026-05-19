"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { track } from "@/lib/analytics";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  /** Sólo el primer slider debe correr la animación de bienvenida. */
  playWelcomeAnimation?: boolean;
  /** Etiquetas opcionales (default: Antes / Después). */
  beforeLabel?: string;
  afterLabel?: string;
  /** Carga prioritaria de imágenes (LCP). Sólo el primer slider. */
  priority?: boolean;
  /** Aspect ratio del contenedor. Default 5:6 portrait — coincide con el
   *  viewBox del SVG source (1260×1500) rasterizado por sharp. */
  aspect?: "4/3" | "1/1" | "3/4" | "3/2" | "16/9" | "5/6";
  /** Callback que dispara en cada interacción granular (pointer drag, key).
   *  Útil para que el padre resetee un timer de auto-avance del carousel. */
  onInteract?: () => void;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0, 0, 0.2, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

/**
 * Slider de comparación antes/después.
 * - Drag con mouse y touch via `onPan` de Motion (abstrae pointer events).
 * - touch-action: pan-y en el handle para no robar scroll vertical.
 * - clip-path animado en la imagen "después" controlado por useMotionValue.
 * - Animación de bienvenida 50 → 70 → 30 → 50 cuando entra al viewport.
 * - Dispara `before_after_interacted` la primera vez que el usuario interactúa.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  playWelcomeAnimation = false,
  beforeLabel = "Antes",
  afterLabel = "Después",
  priority = false,
  aspect = "5/6",
  onInteract,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  // Posición del divisor: 0 = todo "antes", 100 = todo "después".
  const position = useMotionValue(50);
  const interactedRef = useRef(false);
  const [welcomeFinished, setWelcomeFinished] = useState(false);

  // Hint se deriva en render: visible si no hay animación de bienvenida programada
  // (i.e. la sección estática del carousel) o si ya terminó.
  const skipAnimation = !playWelcomeAnimation || reduce;
  const showHint = skipAnimation || welcomeFinished;

  // Animación de bienvenida.
  useEffect(() => {
    if (skipAnimation || !inView) return;
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 350));
      if (cancelled || interactedRef.current) return;
      await animate(position, 70, { duration: 1.0, ease: EASE_OUT }).then(() => null);
      if (cancelled || interactedRef.current) return;
      await animate(position, 30, { duration: 1.2, ease: EASE }).then(() => null);
      if (cancelled || interactedRef.current) return;
      await animate(position, 50, { duration: 0.8, ease: EASE_IN }).then(() => null);
      if (cancelled) return;
      setTimeout(() => {
        if (!cancelled) setWelcomeFinished(true);
      }, 200);
    })();
    return () => {
      cancelled = true;
    };
  }, [skipAnimation, inView, position]);

  // Tracking de la primera interacción.
  useMotionValueEvent(position, "change", () => {
    if (interactedRef.current) return;
    // El cambio puede venir de la animación de bienvenida; sólo trackeamos
    // si el evento original fue del usuario (chequear con un flag separado).
  });

  // Clip-path de la imagen "después": revela solo de 0 a position%.
  const clipPath = useTransform(
    position,
    (p) => `polygon(0% 0%, ${p}% 0%, ${p}% 100%, 0% 100%)`
  );
  // Posición horizontal de la línea + handle.
  const left = useTransform(position, (p) => `${p}%`);

  const aspectClass =
    aspect === "1/1"
      ? "aspect-square"
      : aspect === "3/4"
        ? "aspect-[3/4]"
        : aspect === "4/3"
          ? "aspect-[4/3]"
          : aspect === "16/9"
            ? "aspect-[16/9]"
            : aspect === "3/2"
              ? "aspect-[3/2]"
              : "aspect-[5/6]";

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const next = Math.max(0, Math.min(100, ratio * 100));
    position.set(next);
    // Cada movimiento del slider cuenta como interacción granular para el padre
    // (e.g. para resetear timers de auto-avance del carousel mobile).
    onInteract?.();
  };

  const markInteracted = () => {
    onInteract?.();
    if (interactedRef.current) return;
    interactedRef.current = true;
    track("before_after_interacted");
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className={
          "relative w-full overflow-hidden bg-surface-1 border border-border-subtle " +
          "select-none cursor-ew-resize " +
          aspectClass
        }
        // Permite scroll vertical pero captura horizontal para el drag.
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          markInteracted();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 0 && e.pointerType === "mouse") return;
          // Sólo arrastra si hay botón presionado (mouse) o si es touch activo.
          if (e.pointerType !== "mouse" || e.buttons > 0) {
            updateFromClientX(e.clientX);
          }
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        }}
        role="slider"
        aria-label="Comparador antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            markInteracted();
            position.set(Math.max(0, position.get() - 4));
          } else if (e.key === "ArrowRight") {
            markInteracted();
            position.set(Math.min(100, position.get() + 4));
          }
        }}
      >
        {/* Imagen DESPUÉS (debajo — siempre visible, se revela a la derecha
            cuando el clip de la imagen ANTES (encima) se encoge hacia 0%) */}
        <Image
          src={afterSrc}
          alt={`${alt} — ${afterLabel}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover pointer-events-none select-none"
          priority={priority}
          draggable={false}
        />

        {/* Imagen ANTES (encima, recortada de 0% a position% — visible en el
            lado IZQUIERDO, coincide con la etiqueta "Antes" arriba a la izquierda) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath }}
        >
          <Image
            src={beforeSrc}
            alt={`${alt} — ${beforeLabel}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover select-none"
            priority={priority}
            draggable={false}
          />
        </motion.div>

        {/* Etiquetas Antes / Después */}
        <span
          aria-hidden
          className="absolute top-3 left-3 px-3 py-1.5 text-[0.6rem] tracking-[0.28em] uppercase font-serif text-ivory bg-surface-0/55 backdrop-blur-md border border-accent-gold/30"
        >
          {beforeLabel}
        </span>
        <span
          aria-hidden
          className="absolute top-3 right-3 px-3 py-1.5 text-[0.6rem] tracking-[0.28em] uppercase font-serif text-ivory bg-accent-gold/30 backdrop-blur-md border border-accent-gold/60"
        >
          {afterLabel}
        </span>

        {/* Línea vertical dorada */}
        <motion.div
          aria-hidden
          className="absolute top-0 bottom-0 w-[2px] bg-accent-gold pointer-events-none shadow-[0_0_18px_oklch(65%_0.096_72/0.6)]"
          style={{ left, x: "-1px" }}
        />

        {/* Handle circular con chevrons */}
        <motion.div
          aria-hidden
          className="absolute top-1/2 w-11 h-11 md:w-12 md:h-12 -mt-[22px] md:-mt-[24px] -ml-[22px] md:-ml-[24px] rounded-full bg-accent-gold text-surface-0 flex items-center justify-center shadow-[0_0_24px_oklch(65%_0.096_72/0.55)] pointer-events-none"
          style={{ left }}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <ChevronRight className="w-4 h-4 -ml-1" strokeWidth={2.5} />
        </motion.div>
      </div>

      {/* Microcopy hint */}
      <motion.span
        className="text-[0.68rem] tracking-[0.22em] uppercase text-accent-gold/80 font-light text-center md:text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: showHint ? 1 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="md:hidden">Toca y desliza para ver la transformación</span>
        <span className="hidden md:inline">Desliza para ver la transformación</span>
      </motion.span>
    </div>
  );
}
