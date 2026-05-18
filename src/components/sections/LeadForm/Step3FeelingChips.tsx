"use client";

import { motion, useReducedMotion } from "motion/react";
import { Chip } from "@/components/ui/Chip";
import { useLeadForm } from "./leadFormContext";
import { COPY, FEELINGS, type Feeling } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Step3FeelingChips() {
  const reduce = useReducedMotion();
  const { state, setFeeling } = useLeadForm();
  const current = state.draft.feeling;

  const handle = (f: Feeling) => {
    setFeeling(f);
    track("feeling_selected", { feeling: f });
  };

  return (
    <div className="mt-10 pt-8 border-t border-border-subtle">
      <motion.p
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
        className="font-serif text-[clamp(1.15rem,1.8vw,1.4rem)] text-ivory font-light leading-[1.45] mb-6 max-w-2xl"
      >
        {COPY.form.feeling.question}
      </motion.p>
      <div className="flex flex-wrap gap-3">
        {FEELINGS.map((f) => (
          <Chip
            key={f}
            selected={current === f}
            onClick={() => handle(f)}
            ariaLabel={`Elegir sentimiento: ${f}`}
          >
            {f}
          </Chip>
        ))}
      </div>
    </div>
  );
}
