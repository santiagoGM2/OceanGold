"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  Wrench,
  Shuffle,
  PencilRuler,
  Sparkles,
  Puzzle,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";
import { COPY, SERVICES, type ServiceId } from "@/lib/constants";
import { useLeadForm } from "@/components/sections/LeadForm/leadFormContext";
import { track } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  shuffle: Shuffle,
  pencilRuler: PencilRuler,
  sparkles: Sparkles,
  puzzle: Puzzle,
  searchCheck: SearchCheck,
};

export function Situations() {
  const reduce = useReducedMotion();
  const { selectServiceAndScroll } = useLeadForm();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };

  // Las cards entran ALTERNANDO desde la izquierda y la derecha (tejido).
  const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];
  const cardInFromLeft = {
    hidden: reduce ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -32, y: 16 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };
  const cardInFromRight = {
    hidden: reduce ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 32, y: 16 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE_OUT },
    },
  };

  const headerIn = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const handleSelect = (service: ServiceId) => {
    track("situation_selected", { service });
    selectServiceAndScroll(service);
  };

  const waUrl = buildWhatsAppUrl(COPY.situations.waMessage);

  return (
    <section
      ref={sectionRef}
      id="situaciones"
      className="relative px-6 md:px-14 py-20 md:py-32 border-t border-border-subtle"
    >
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <motion.span
          variants={headerIn}
          className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light"
        >
          {COPY.situations.eyebrow}
        </motion.span>
        <motion.h2
          variants={headerIn}
          className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[0.02em] mb-3 max-w-3xl"
        >
          {COPY.situations.title}
        </motion.h2>
        <motion.p
          variants={headerIn}
          className="text-text-muted font-light max-w-2xl mb-14"
        >
          Elige el caso que más se parece al tuyo. Cada camino abre un
          diagnóstico personalizado.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle/40 border border-border-subtle">
          {SERVICES.map((s, idx) => {
            const Icon = ICONS[s.icon] ?? Sparkles;
            const variants = idx % 2 === 0 ? cardInFromLeft : cardInFromRight;
            return (
              <motion.button
                key={s.id}
                type="button"
                variants={variants}
                whileHover={
                  reduce
                    ? undefined
                    : {
                        y: -4,
                        transition: { duration: 0.35, ease: EASE },
                      }
                }
                onClick={() => handleSelect(s.id)}
                aria-label={`Comenzar diagnóstico para: ${s.name}`}
                className="group relative bg-surface-1/95 text-left px-7 py-9 md:px-8 md:py-10 cursor-pointer overflow-hidden transition-[background,box-shadow] duration-500 hover:bg-surface-2/95 hover:shadow-[0_18px_44px_oklch(65%_0.096_72/0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-0"
              >
                {/* Línea superior dorada que aparece en hover */}
                <span
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                {/* Index sutil al fondo derecho */}
                <span
                  aria-hidden
                  className="absolute top-7 right-7 font-serif text-2xl text-accent-gold/30 font-light tracking-[0.04em] transition-colors duration-500 group-hover:text-accent-gold/70"
                >
                  {s.index}
                </span>

                <Icon
                  className="icon-spin-on-hover w-7 h-7 text-accent-gold mb-6"
                  strokeWidth={1.25}
                  aria-hidden
                />

                <h3 className="font-serif text-[1.45rem] md:text-[1.55rem] text-ivory font-light tracking-[0.02em] mb-2">
                  {s.name}
                </h3>
                <p className="font-sans text-[0.85rem] italic text-accent-gold mb-4 font-light tracking-[0.02em]">
                  {s.tagline}
                </p>
                <p className="text-[0.88rem] text-text-muted leading-[1.75] font-light mb-8 max-w-[38ch]">
                  {s.desc}
                </p>

                <span className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.28em] uppercase text-accent-gold font-light pt-2 border-t border-border-subtle group-hover:gap-3 transition-all duration-300">
                  Comenzar
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* CTA general → WhatsApp directo */}
        <motion.div
          variants={headerIn}
          className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-4xl"
        >
          <p className="text-text-muted font-light">
            ¿No encuentras tu caso entre los anteriores?
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cta-section="situations"
            data-cta-label="whatsapp"
            onClick={() => track("cta_clicked", { section: "situations", label: "whatsapp" })}
            className="inline-flex items-center gap-3 px-6 py-3 border border-border-subtle text-text-default font-sans text-[0.68rem] tracking-[0.22em] uppercase hover:border-accent-gold hover:text-accent-gold transition-colors duration-300"
          >
            {COPY.situations.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
