"use client";

import { motion, useReducedMotion } from "motion/react";
import { SERVICES, type ServiceId } from "@/lib/constants";
import { useLeadForm } from "./leadFormContext";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Step1Service() {
  const reduce = useReducedMotion();
  const { selectService, go } = useLeadForm();

  const handle = (id: ServiceId) => {
    track("situation_selected", { service: id });
    selectService(id);
    track("form_step_completed", { step_number: 1, step_name: "service" });
    go("photo");
  };

  return (
    <motion.div
      key="step1"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.2] mb-3">
        ¿Cuál es tu situación?
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-8">
        Elige la opción que más se parece a tu caso. Si no estás seguro, elige
        &ldquo;No sé qué necesita&rdquo; y un asesor te orienta.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handle(s.id)}
            className="group relative text-left p-5 pr-14 border border-border-subtle bg-surface-0/40 rounded-md hover:bg-surface-2/70 hover:border-accent-gold/60 hover:shadow-[0_8px_24px_oklch(0%_0_0/0.18),0_0_0_1px_oklch(65%_0.096_72/0.18)] hover:-translate-y-[2px] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
          >
            {/* Index badge top-right — refinement de taste sobre cards planas.
                Aparece con scale + fade en el hover del padre. */}
            <span
              aria-hidden
              className="absolute top-4 right-4 font-serif text-[0.78rem] tracking-[0.12em] text-accent-gold/35 group-hover:text-accent-gold transition-colors duration-300"
            >
              {s.index}
            </span>
            <span className="font-serif text-ivory text-lg block group-hover:translate-x-0.5 transition-transform duration-300">
              {s.name}
            </span>
            <span className="text-[0.85rem] italic text-accent-gold font-light block mt-1">
              {s.tagline}
            </span>
            {/* Arrow indicator que aparece en hover — afirma que es clickable */}
            <span
              aria-hidden
              className="absolute bottom-4 right-5 text-accent-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-sm"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
