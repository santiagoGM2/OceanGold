"use client";

/**
 * Renderer compartido por las 6 ramas del quiz. Recibe una lista de campos
 * y se encarga del layout + validación + transición a Step4.
 *
 * Cada rama (Reparacion/Transformacion/Personalizacion/Mantenimiento/
 * Armado/Diagnostico) exporta un componente que solo invoca este renderer
 * con su `fields` config.
 */

import { motion, useReducedMotion } from "motion/react";
import { useLeadForm } from "../leadFormContext";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { track } from "@/lib/analytics";
import type { QuizFieldState } from "@/types/lead";

const EASE = [0.16, 1, 0.3, 1] as const;

export interface QuizFieldConfig {
  key: string;
  question: string;
  options: readonly string[];
  multiSelect: boolean;
  /** Si true, añade chip "Otro" al final con input de texto libre. */
  hasOther?: boolean;
  /** Si true, requiere al menos 1 valor seleccionado para continuar. */
  required?: boolean;
}

interface Props {
  fields: readonly QuizFieldConfig[];
}

const EMPTY_FIELD: QuizFieldState = { values: [], otherText: "" };

export function QuizRenderer({ fields }: Props) {
  const reduce = useReducedMotion();
  const { state, setQuizField, computeFeelingFromQuiz, go } = useLeadForm();

  const getField = (key: string): QuizFieldState =>
    state.draft.quizAnswers[key] ?? EMPTY_FIELD;

  const isFieldFilled = (cfg: QuizFieldConfig): boolean => {
    const f = getField(cfg.key);
    if (!cfg.required) return true;
    if (f.values.length === 0) return false;
    // Si seleccionó "Otro" y no escribió nada, no consideramos cumplido.
    if (f.values.includes("Otro") && !f.otherText.trim() && f.values.length === 1) {
      return false;
    }
    return true;
  };

  const canContinue = fields.every(isFieldFilled);

  const onSubmit = () => {
    if (!canContinue) return;
    const feeling = computeFeelingFromQuiz();
    track("form_step_completed", { step_number: 4, step_name: "quiz" });
    track("feeling_selected", { feeling });
    go("contact");
  };

  return (
    <motion.div
      key="step3"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      <h3 className="font-serif text-[clamp(1.7rem,2.6vw,2.4rem)] text-text-strong font-light leading-[1.18] tracking-[-0.01em] mb-3">
        Cuéntanos un poco más
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-10 leading-[1.7]">
        Estas respuestas guían el diagnóstico del maestro joyero. No hay
        respuesta incorrecta.
      </p>

      <div className="space-y-10 max-w-2xl">
        {fields.map((cfg) => {
          const f = getField(cfg.key);
          return (
            <ChipGroup
              key={cfg.key}
              question={cfg.question}
              options={cfg.options}
              multiSelect={cfg.multiSelect}
              hasOther={cfg.hasOther}
              required={cfg.required}
              value={f.values}
              otherText={f.otherText}
              onChange={(values, otherText) =>
                setQuizField(cfg.key, { values, otherText: otherText ?? "" })
              }
            />
          );
        })}
      </div>

      <div className="mt-12 flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => go("photo")}
          className="text-[0.65rem] tracking-[0.22em] uppercase text-text-muted hover:text-accent-gold transition-colors cursor-pointer self-start"
        >
          ← Volver a la foto
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canContinue}
          className="gold-cta inline-flex items-center gap-4 px-9 py-3.5 rounded-lg border border-accent-gold text-accent-gold font-sans text-[0.68rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-gold"
        >
          Continuar
          <span aria-hidden>→</span>
        </button>
      </div>
    </motion.div>
  );
}
