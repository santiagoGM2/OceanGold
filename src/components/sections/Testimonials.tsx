"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY, TESTIMONIALS } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 8000;

export function Testimonials() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Auto-play lento (8s). Se pausa en hover/focus o si reduce-motion.
  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  // Flip 3D sutil para cada card de testimonio.
  const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];
  const cardFlip = {
    hidden: reduce
      ? { opacity: 1, rotateY: 0, y: 0 }
      : { opacity: 0, rotateY: -15, y: 24 },
    visible: {
      opacity: 1,
      rotateY: 0,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE_OUT },
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

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="relative px-6 md:px-14 py-20 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light"
        >
          {COPY.testimonials.eyebrow}
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[0.02em] mb-14 max-w-3xl"
        >
          {COPY.testimonials.title}
        </motion.h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-subtle/40 border-y border-border-subtle"
          style={{ perspective: "1200px" }}
        >
          {TESTIMONIALS.map((t, i) => {
            const isActive = i === active;
            return (
              <motion.article
                key={t.id}
                variants={cardFlip}
                whileHover={
                  reduce
                    ? undefined
                    : {
                        y: -6,
                        transition: { duration: 0.35, ease: EASE },
                      }
                }
                aria-current={isActive ? "true" : undefined}
                className={
                  "group relative bg-surface-1/95 px-8 py-10 cursor-default transition-colors duration-500 " +
                  (isActive
                    ? "ring-1 ring-accent-gold/40 shadow-[0_0_38px_oklch(65%_0.096_72/0.18)]"
                    : "")
                }
                onClick={() => setActive(i)}
              >
                {/* Cita visual */}
                <span
                  aria-hidden
                  className="absolute top-4 left-6 font-serif text-7xl leading-none text-accent-gold/25 select-none"
                >
                  &ldquo;
                </span>

                <p className="relative font-light text-[0.95rem] leading-[1.8] text-text-default italic mt-8 mb-8">
                  {t.quote}
                </p>

                <div className="border-t border-border-subtle pt-5">
                  <span className="block font-serif text-ivory tracking-[0.04em]">
                    {t.name}
                  </span>
                  <span className="block text-[0.68rem] tracking-[0.22em] uppercase text-accent-gold font-light mt-2">
                    {t.role}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Indicadores de carousel + CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mt-10">
          <div className="flex items-center gap-3" role="tablist" aria-label="Testimonios">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonio ${i + 1}`}
                onClick={() => setActive(i)}
                className={
                  "h-[2px] transition-all duration-500 cursor-pointer " +
                  (i === active
                    ? "w-12 bg-accent-gold"
                    : "w-6 bg-border-subtle hover:bg-accent-gold/50")
                }
              />
            ))}
          </div>

          <a
            href="#diagnostico"
            data-cta-section="testimonials"
            data-cta-label={COPY.testimonials.cta}
            className="gold-cta inline-flex items-center gap-3 self-start md:self-auto px-7 py-3 border border-accent-gold text-accent-gold font-sans text-[0.68rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.testimonials.cta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
