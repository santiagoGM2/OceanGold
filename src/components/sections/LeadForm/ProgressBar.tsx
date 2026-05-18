"use client";

import { motion, useReducedMotion } from "motion/react";
import { STEPS, type StepId } from "./leadFormContext";

const STEP_LABELS: Record<StepId, string> = {
  service: "Servicio",
  photo: "Foto",
  aha: "Análisis",
  quiz: "Quiz",
  contact: "Contacto",
  calendar: "Agendar",
};

export function ProgressBar({ current }: { current: StepId }) {
  const reduce = useReducedMotion();
  const idx = STEPS.indexOf(current);
  const pct = ((idx + 1) / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.6rem] tracking-[0.28em] uppercase text-accent-gold font-light">
          Paso {idx + 1} de {STEPS.length}
        </span>
        <span className="text-[0.6rem] tracking-[0.22em] uppercase text-text-muted font-light">
          {STEP_LABELS[current]}
        </span>
      </div>
      <div className="h-[2px] w-full bg-border-subtle relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent-gold"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 220, damping: 28 }
          }
        />
      </div>
    </div>
  );
}
