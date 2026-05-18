"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { BUSINESS, COPY } from "@/lib/constants";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Jewel } from "@/components/ui/Jewel";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Authority() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.25 });

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="autoridad"
      className="relative px-6 md:px-14 py-20 md:py-32 border-t border-border-subtle overflow-hidden"
    >
      {/* Jewel flotante decorativo (solo desktop, pequeño) */}
      <div
        aria-hidden
        className="hidden lg:block absolute right-[-3%] bottom-[8%] w-[220px] aspect-square pointer-events-none opacity-70"
      >
        <Jewel />
      </div>
      <motion.div
        initial="hidden"
        animate={sectionInView ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light"
        >
          {COPY.authority.eyebrow}
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[0.02em] mb-14 max-w-4xl"
        >
          {COPY.authority.title}
        </motion.h2>

        {/* Stats grandes — comparten AnimatedCounter con el Hero */}
        <motion.div
          ref={statsRef}
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-subtle/40 mb-16 border-y border-border-subtle"
        >
          <div
            data-revealed={statsInView ? "true" : "false"}
            className="bg-surface-0 px-8 py-10 text-center stat-spotlight"
          >
            <span className="relative z-[1] font-serif text-[clamp(2.4rem,5vw,4rem)] font-light text-accent-gold block leading-none">
              <AnimatedCounter to={BUSINESS.yearsOfCraft} />
            </span>
            <span className="relative z-[1] block text-[0.67rem] tracking-[0.28em] uppercase text-text-muted mt-3 font-light">
              Años de oficio artesanal
            </span>
          </div>
          <div
            data-revealed={statsInView ? "true" : "false"}
            className="bg-surface-0 px-8 py-10 text-center stat-spotlight"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="relative z-[1] font-serif text-[clamp(2.4rem,5vw,4rem)] font-light text-accent-gold block leading-none">
              <AnimatedCounter to={BUSINESS.storiesRecovered} prefix="+" />
            </span>
            <span className="relative z-[1] block text-[0.67rem] tracking-[0.28em] uppercase text-text-muted mt-3 font-light">
              Historias recuperadas
            </span>
          </div>
          <div
            data-revealed={statsInView ? "true" : "false"}
            className="bg-surface-0 px-8 py-10 text-center stat-spotlight"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="relative z-[1] font-serif text-[clamp(2.4rem,5vw,4rem)] font-light text-accent-gold block leading-none">
              <AnimatedCounter to={BUSINESS.averageRating} decimals={1} />
            </span>
            <span className="relative z-[1] block text-[0.67rem] tracking-[0.28em] uppercase text-text-muted mt-3 font-light">
              Calificación promedio
            </span>
          </div>
        </motion.div>

        {/* Diferenciadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 mb-16 max-w-5xl">
          {BUSINESS.differentiators.map((d, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-start gap-4 text-text-default"
            >
              <span className="mt-2 w-2 h-2 flex-shrink-0 bg-accent-gold rotate-45" />
              <span className="text-[0.95rem] leading-[1.65] font-light">
                {d}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bloque de ubicación y horario */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-subtle/40 border border-border-subtle max-w-5xl"
        >
          <div className="bg-surface-0 px-8 py-8">
            <span className="block text-[0.6rem] tracking-[0.32em] uppercase text-text-muted font-light mb-3">
              Visítanos
            </span>
            <span className="block font-serif text-ivory text-lg leading-[1.5] mb-1">
              {BUSINESS.address.street}
            </span>
            <span className="block text-text-muted text-sm font-light">
              {BUSINESS.address.neighborhood}, {BUSINESS.address.region}
            </span>
          </div>
          <div className="bg-surface-0 px-8 py-8">
            <span className="block text-[0.6rem] tracking-[0.32em] uppercase text-text-muted font-light mb-3">
              Horario de atención
            </span>
            <span className="block font-serif text-ivory text-lg leading-[1.5] mb-1">
              {BUSINESS.hours.label}
            </span>
            <span className="block text-text-muted text-sm font-light">
              Lunes a sábado
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
