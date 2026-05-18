"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLeadForm } from "./leadFormContext";
import { COPY } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Step2bAhaReveal() {
  const reduce = useReducedMotion();
  const { go } = useLeadForm();

  const onContinue = () => {
    track("aha_reveal_continued");
    track("form_step_completed", { step_number: 3, step_name: "aha_reveal" });
    go("quiz");
  };

  return (
    <motion.div
      key="step2b"
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
      className="text-center max-w-2xl mx-auto py-8"
    >
      <motion.div
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.1 }}
      >
        <span className="block text-[0.6rem] tracking-[0.32em] uppercase text-accent-gold mb-6 font-light">
          Análisis preliminar
        </span>
      </motion.div>

      <motion.h3
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : 0.25 }}
        className="font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] text-ivory font-light leading-[1.3] tracking-[0.01em] mb-6"
      >
        {COPY.form.aha.title}
      </motion.h3>

      <motion.p
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : 0.55 }}
        className="text-[clamp(0.95rem,1.4vw,1.05rem)] text-accent-gold italic font-light leading-[1.8] max-w-xl mx-auto mb-10"
      >
        {COPY.form.aha.subtitle}
      </motion.p>

      <motion.div
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.85 }}
      >
        <button
          type="button"
          onClick={onContinue}
          className="cta-pulse gold-cta inline-flex items-center gap-4 px-10 py-4 border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0 cursor-pointer"
        >
          {COPY.form.aha.cta}
          <span aria-hidden>→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
