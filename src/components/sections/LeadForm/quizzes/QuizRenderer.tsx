"use client";

/**
 * Renderer compartido por las 6 ramas del quiz. Recibe una lista de campos
 * y se encarga del layout + validación + transición a Step4.
 *
 * Rediseño F.8 (Impeccable pass): el contenido del quiz ya no flota plano
 * sobre el surface. Estructura editorial con:
 *   - Eyebrow + título + subtítulo italic con peso jerárquico claro.
 *   - Container del field con un acento dorado vertical a la izquierda y
 *     bg sutil para anclarlo como "área de trabajo" del usuario.
 *   - Continue button sólido (no transparente) coherente con Hero/Step4.
 *
 * Cada rama (Reparacion/Transformacion/Personalizacion/Mantenimiento/
 * Armado/Diagnostico) exporta un componente que sólo invoca este renderer
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

  // Stagger interno del bloque entero (header → field card → CTA).
  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: EASE },
    },
  };

  return (
    <motion.div
      key="step3"
      initial={reduce ? "visible" : "hidden"}
      animate="visible"
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      variants={stagger}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      {/* Header editorial: eyebrow con line mark + título + subtítulo italic
          en gold-soft. Construye la jerarquía visual que en la versión plana
          se perdía. */}
      <motion.div variants={fadeUp} className="mb-9">
        <span className="inline-flex items-center gap-3 text-[0.62rem] tracking-[0.32em] uppercase text-accent-gold font-medium mb-4">
          <span aria-hidden className="block w-6 h-px bg-accent-gold" />
          Diagnóstico psicológico
        </span>
        <h3 className="font-serif text-[clamp(1.7rem,2.6vw,2.35rem)] text-ivory font-light leading-[1.12] tracking-[-0.01em] mb-4">
          Cuéntanos un poco más.
        </h3>
        <p className="text-text-default font-light text-[clamp(0.97rem,1.3vw,1.06rem)] leading-[1.75] max-w-xl italic">
          Estas respuestas guían el diagnóstico del maestro joyero. No hay
          respuesta incorrecta.
        </p>
      </motion.div>

      {/* Card del field: bg sutil, borde-l dorado (acento editorial), padding
          generoso. Distingue visualmente la zona de interacción de los
          textos arriba. */}
      <motion.div
        variants={fadeUp}
        className="relative bg-surface-0/35 border-l-2 border-accent-gold/60 rounded-r-md px-6 sm:px-8 py-7 sm:py-8 mb-10 max-w-3xl"
      >
        {/* Marker dorado decorativo: pequeña diagonal arriba-derecha del card.
            No es icono. Es un detalle de orfebrería editorial. */}
        <span
          aria-hidden
          className="absolute top-3 right-4 inline-flex items-center gap-1.5"
        >
          <span className="block w-1 h-1 rotate-45 bg-accent-gold/70" />
          <span className="block w-4 h-px bg-accent-gold/40" />
        </span>

        <div className="space-y-10">
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
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 max-w-3xl"
      >
        <button
          type="button"
          onClick={() => go("photo")}
          className="text-[0.65rem] tracking-[0.22em] uppercase text-text-muted hover:text-accent-gold transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Volver a la foto
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canContinue}
          className={
            "gold-cta inline-flex items-center justify-center gap-3 px-9 md:px-10 py-4 border font-sans font-medium text-[0.72rem] tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer rounded-sm " +
            (canContinue
              ? "border-accent-gold bg-accent-gold text-surface-0 hover:bg-gold-l shadow-[0_8px_24px_oklch(0%_0_0/0.3)]"
              : "border-border-subtle bg-transparent text-text-muted/60 cursor-not-allowed")
          }
        >
          Continuar
          <span aria-hidden>→</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
