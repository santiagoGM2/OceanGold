"use client";

/**
 * Hero — rediseño "agency-level" Fase F.8.
 *
 * Cambios vs. versión anterior:
 *   - Stats de borde lateral → 3 **cards** con bg-surface-0/65 + backdrop-blur.
 *     Marca editorial (línea dorada top-left) y tipografía más generosa.
 *   - CTA pasaba de `border + transparent bg` → `bg-accent-gold sólido + text-surface-0`
 *     con shadow drop. Cero ambigüedad de contraste sobre el video.
 *   - Backplate de contraste reforzado: gradient horizontal izquierda → derecha
 *     que cubre el bloque de texto (sumado al overlay más oscuro en
 *     HeroVideoBackground). Texto legible bajo cualquier frame del video.
 *   - Eliminado el ornamento "diamond" lateral derecho — venía como ruido
 *     decorativo template. La autoridad la cargan ahora las cards.
 *   - Microcopy secundario junto al CTA reduce la fricción cognitiva sin
 *     agregar peso visual.
 */

import { motion, useReducedMotion } from "motion/react";
import { BUSINESS, COPY, STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const titleWords = COPY.hero.title.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.05,
        delayChildren: reduce ? 0 : 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const statsContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.12,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const statCard = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.6, ease: EASE },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col px-6 md:px-14 py-20 md:py-32 isolate overflow-hidden"
    >
      <HeroVideoBackground />

      {/* Backplate horizontal — gradient malachite estrecho a la izquierda que
          asegura WCAG AA sobre cualquier frame del video sin oscurecer el
          lado derecho (donde se ve el shimmer del oro). */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(95deg, oklch(6.5% 0.018 158 / 0.72) 0%, oklch(6.5% 0.018 158 / 0.4) 42%, transparent 78%)",
        }}
      />

      <header className="absolute top-8 left-6 right-6 md:top-10 md:left-14 md:right-14 flex items-center justify-between z-10">
        <span
          className="text-champagne font-normal tracking-[0.02em] text-[clamp(1.4rem,1.6vw,1.7rem)] leading-none"
          style={{ fontFamily: "var(--font-wordmark)" }}
        >
          {BUSINESS.name}
        </span>
        <span className="hidden md:inline text-[0.68rem] font-light tracking-[0.38em] text-accent-gold uppercase">
          Joyería de autor en {BUSINESS.location}
        </span>
      </header>

      <motion.div
        className="mt-auto mb-auto max-w-7xl mx-auto w-full relative z-[3]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Eyebrow con línea editorial */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
          <span aria-hidden className="block w-10 h-px bg-accent-gold" />
          <span
            className="text-[0.7rem] font-medium tracking-[0.38em] text-accent-gold uppercase"
            style={{ textShadow: "0 1px 14px oklch(0% 0 0 / 0.5)" }}
          >
            El renacimiento de tu joya
          </span>
        </motion.div>

        <h1
          className="font-serif font-light leading-[1.05] tracking-[-0.025em] text-ivory text-[clamp(2.5rem,5.5vw,6rem)] mb-8 max-w-5xl"
          style={{
            textShadow:
              "0 2px 22px oklch(0% 0 0 / 0.55), 0 1px 3px oklch(0% 0 0 / 0.45)",
          }}
        >
          {/* Mobile: h1 plano con CSS fade. Desktop: stagger por palabra. */}
          <span className="lg:hidden h1-mobile-fade">{COPY.hero.title}</span>
          <span className="hidden lg:inline">
            {titleWords.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-baseline"
              >
                <motion.span
                  variants={wordVariants}
                  className="inline-block pr-[0.25em]"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <p
          className="text-[clamp(1.02rem,1.7vw,1.2rem)] font-normal text-ivory/90 max-w-[52ch] leading-[1.75] mb-14 tracking-[0.01em]"
          style={{
            textShadow:
              "0 2px 18px oklch(0% 0 0 / 0.55), 0 1px 2px oklch(0% 0 0 / 0.4)",
          }}
        >
          {COPY.hero.subtitle}
        </p>

        {/* Stats cards — cada stat en su propio container con backdrop-blur
            para que los números floten sobre el video con contraste alto.
            Stagger interno: aparecen secuencialmente. */}
        <motion.div
          variants={statsContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mb-14"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              variants={statCard}
              className="group relative bg-surface-0/65 backdrop-blur-md border border-accent-gold/25 rounded-md px-5 py-6 md:px-6 md:py-7 hover:border-accent-gold/55 hover:bg-surface-0/78 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5"
            >
              {/* Marker editorial: línea dorada que sale del borde superior */}
              <span
                aria-hidden
                className="absolute top-0 left-6 -translate-y-px w-7 h-px bg-accent-gold"
              />
              <span className="font-serif text-[clamp(1.95rem,3.8vw,2.85rem)] font-light text-accent-gold block leading-none mb-3">
                <AnimatedCounter
                  to={s.value}
                  prefix={"prefix" in s ? s.prefix ?? "" : ""}
                  decimals={"decimals" in s ? s.decimals ?? 0 : 0}
                />
              </span>
              <span className="block text-[0.62rem] md:text-[0.68rem] tracking-[0.24em] uppercase text-ivory/85 font-light leading-[1.45]">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-center gap-5"
        >
          {/* CTA sólido — bg-accent-gold + text-surface-0 desde el rest state.
              shadow drop firme que despega el botón del video. cta-pulse
              señaliza la acción cada 5s. */}
          <a
            href="#diagnostico"
            data-cta-section="hero"
            data-cta-label={COPY.hero.cta}
            className="cta-pulse gold-cta inline-flex items-center justify-center gap-4 px-9 md:px-11 py-4 md:py-[1.05rem] border border-accent-gold bg-accent-gold text-surface-0 font-sans font-medium text-[0.74rem] md:text-[0.78rem] tracking-[0.24em] uppercase hover:bg-gold-l rounded-sm shadow-[0_10px_30px_oklch(0%_0_0/0.4)]"
          >
            {COPY.hero.cta}
            <span aria-hidden>→</span>
          </a>
          <span
            className="text-[0.72rem] tracking-[0.18em] uppercase text-ivory/80 font-light leading-[1.5]"
            style={{ textShadow: "0 1px 10px oklch(0% 0 0 / 0.45)" }}
          >
            <span className="block text-accent-gold/90 font-medium">Sin costo</span>
            <span className="block text-ivory/60 text-[0.65rem] mt-0.5">
              Toma {BUSINESS.diagnosticDuration}
            </span>
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
