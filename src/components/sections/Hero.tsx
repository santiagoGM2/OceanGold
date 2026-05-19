"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BUSINESS, COPY, STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Dividimos el título en palabras para animar palabra por palabra.
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

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-[100svh] flex flex-col px-6 md:px-14 py-20 md:py-32 isolate overflow-hidden"
    >
      <HeroVideoBackground heroRef={heroRef} />

      <header className="absolute top-8 left-6 right-6 md:top-10 md:left-14 md:right-14 flex items-center justify-between z-10">
        <span className="font-serif text-[0.95rem] tracking-[0.35em] text-champagne uppercase">
          {BUSINESS.name}
        </span>
        <span className="hidden md:inline text-[0.68rem] font-light tracking-[0.38em] text-accent-gold uppercase">
          Joyería de autor · {BUSINESS.location}
        </span>
      </header>

      <motion.div
        className="mt-auto mb-auto max-w-7xl mx-auto w-full relative z-[3]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.span
          variants={fadeUp}
          className="block text-[0.68rem] font-light tracking-[0.38em] text-accent-gold uppercase mb-8"
        >
          El renacimiento de tu joya
        </motion.span>

        <h1 className="font-serif font-light leading-[1.05] tracking-[-0.025em] text-ivory text-[clamp(2.5rem,5.5vw,6rem)] mb-10">
          {/* Mobile (<1024px): h1 plano, fade-in 200ms via CSS — sin hydration flash. */}
          <span className="lg:hidden h1-mobile-fade">{COPY.hero.title}</span>
          {/* Desktop (≥1024px): stagger word-by-word — preserva el wow factor. */}
          <span className="hidden lg:inline">
            {titleWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-baseline">
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

        {/* Subtitle estático (no `motion.p`) para mantener un LCP rápido.
            La animación del título palabra-por-palabra ya entrega la secuencia narrativa;
            ocultar este texto durante la hidratación arrastraba el LCP a >3s en mobile. */}
        <p className="text-[clamp(0.95rem,1.6vw,1.1rem)] font-light text-text-muted max-w-[48ch] leading-[1.9] mb-12 tracking-[0.02em]">
          {COPY.hero.subtitle}
        </p>

        <motion.div
          variants={fadeUp}
          className="grid grid-cols-3 gap-2 max-w-2xl mb-12 border-t border-border-subtle pt-8"
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              className={
                "px-3 md:px-6 text-center " +
                (i > 0 ? "border-l border-border-subtle" : "")
              }
            >
              <span className="font-serif text-[clamp(1.7rem,3.8vw,2.8rem)] font-light text-accent-gold block leading-none">
                <AnimatedCounter
                  to={s.value}
                  prefix={"prefix" in s ? s.prefix ?? "" : ""}
                  decimals={"decimals" in s ? s.decimals ?? 0 : 0}
                />
              </span>
              <span className="block text-[0.6rem] md:text-[0.67rem] tracking-[0.22em] uppercase text-text-muted mt-2 font-light">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <a
            href="#diagnostico"
            data-cta-section="hero"
            data-cta-label={COPY.hero.cta}
            className="cta-pulse gold-cta inline-flex items-center gap-4 px-10 py-4 border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.hero.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
