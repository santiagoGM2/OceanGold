"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Alert() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // El copy localStat de constants.ts es:
  // "En Miami, más del 60% de las joyas familiares se pierden por daños que se pudieron reparar a tiempo."
  // Lo partimos para inyectar un span animado en "60%".
  const localStat = COPY.alert.localStat;
  const parts = localStat.split(/(60\s?%)/i);

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
        staggerChildren: reduce ? 0 : 0.15,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  // Overshoot: arranca pequeño, sobrepasa al 1.1, vuelve a 1.
  const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];
  const numberPop = {
    hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.55 },
    visible: {
      opacity: 1,
      scale: reduce ? 1 : [0.55, 1.1, 1],
      transition: {
        duration: reduce ? 0 : 1.1,
        ease: EASE_OUT,
        delay: reduce ? 0 : 0.6,
        times: reduce ? undefined : [0, 0.65, 1],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="alerta"
      className="relative px-6 md:px-14 py-20 md:py-32 border-y border-border-subtle bg-surface-1/40"
    >
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-6 font-light"
        >
          {COPY.alert.eyebrow}
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-[clamp(1.9rem,3.6vw,3.2rem)] text-ivory font-light leading-[1.18] tracking-[0.01em] mb-8 max-w-4xl"
        >
          {COPY.alert.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-[clamp(1rem,1.4vw,1.15rem)] text-text-default font-light leading-[1.85] max-w-3xl mb-10"
        >
          {COPY.alert.body}
        </motion.p>

        {/* Dato local con el 60% destacado (scale-up + glow) */}
        <motion.p
          variants={fadeUp}
          className="font-serif text-[clamp(1.25rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.35] tracking-[0.01em] max-w-4xl mb-12"
        >
          {parts.map((chunk, i) => {
            if (/60\s?%/.test(chunk)) {
              return (
                <motion.span
                  key={i}
                  variants={numberPop}
                  className="inline-block text-accent-gold gold-glow font-normal mx-1"
                  style={{ originY: 0.6 }}
                >
                  {chunk}
                </motion.span>
              );
            }
            return <span key={i}>{chunk}</span>;
          })}
        </motion.p>

        <motion.div variants={fadeUp}>
          <a
            href="#diagnostico"
            data-cta-section="alert"
            data-cta-label={COPY.alert.cta}
            className="gold-cta inline-flex items-center gap-4 px-10 py-4 border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.alert.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
