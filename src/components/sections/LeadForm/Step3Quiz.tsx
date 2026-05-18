"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLeadForm } from "./leadFormContext";
import { Step3FeelingChips } from "./Step3FeelingChips";
import { track } from "@/lib/analytics";
import type { ServiceId } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;

type QuizField =
  | {
      key: string;
      label: string;
      type: "options";
      options: string[];
    }
  | {
      key: string;
      label: string;
      type: "text";
      placeholder?: string;
    };

const QUIZZES: Record<string, QuizField[]> = {
  reparacion_mantenimiento_armado: [
    {
      key: "feel_when_seeing",
      label: "¿Qué sientes cuando ves esa joya guardada?",
      type: "options",
      options: ["Orgullo", "Frustración", "Nostalgia", "Miedo a perderla"],
    },
    {
      key: "stored_for",
      label: "¿Hace cuánto la guardaste?",
      type: "options",
      options: ["Menos de 1 mes", "1 a 6 meses", "Más de 6 meses", "Años"],
    },
    {
      key: "first_thing_tomorrow",
      label: "Si pudieras recuperar su brillo mañana, ¿qué es lo primero que harías con ella?",
      type: "text",
      placeholder: "Volver a usarla en…",
    },
  ],
  transformacion: [
    {
      key: "heirloom",
      label: "¿Esta joya viene de una herencia familiar?",
      type: "options",
      options: ["Sí", "No"],
    },
    {
      key: "preserve",
      label: "¿Qué quieres conservar de la pieza original?",
      type: "text",
      placeholder: "Una piedra, una forma, el oro…",
    },
    {
      key: "style",
      label: "¿Qué estilo nuevo te imaginas?",
      type: "options",
      options: ["Minimalista", "Clásico moderno", "Vanguardista", "No estoy seguro"],
    },
  ],
  personalizacion: [
    {
      key: "reference",
      label: "¿Tienes alguna referencia o imagen de lo que tienes en mente?",
      type: "text",
      placeholder: "Descríbela o cuéntanos qué inspiración tienes",
    },
    {
      key: "gift_or_self",
      label: "¿Es para un regalo especial o para ti?",
      type: "options",
      options: ["Regalo", "Para mí"],
    },
    {
      key: "metal_or_gem",
      label: "¿Tienes algún metal o piedra en mente?",
      type: "text",
      placeholder: "Oro 14K, diamante, esmeralda…",
    },
  ],
  diagnostico: [
    {
      key: "main_concern",
      label: "¿Cuál es tu mayor preocupación con esta pieza?",
      type: "text",
      placeholder: "Tengo miedo de que…",
    },
    {
      key: "last_used",
      label: "¿Cuándo fue la última vez que la usaste?",
      type: "text",
      placeholder: "Hace un mes / nunca / en una boda…",
    },
  ],
};

function pickQuiz(service: ServiceId | null): QuizField[] {
  if (!service) return [];
  if (service === "reparacion" || service === "mantenimiento" || service === "armado") {
    return QUIZZES.reparacion_mantenimiento_armado;
  }
  if (service === "transformacion") return QUIZZES.transformacion;
  if (service === "personalizacion") return QUIZZES.personalizacion;
  return QUIZZES.diagnostico;
}

export function Step3Quiz() {
  const reduce = useReducedMotion();
  const { state, setQuizAnswer, go } = useLeadForm();
  const questions = pickQuiz(state.draft.service);

  const canContinue =
    questions.every((q) => (state.draft.quizAnswers[q.key] ?? "").trim().length > 0) &&
    state.draft.feeling !== null;

  const onSubmit = () => {
    if (!canContinue) return;
    track("form_step_completed", { step_number: 4, step_name: "quiz" });
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
      <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.2] mb-3">
        Cuéntanos un poco más
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-8">
        Estas respuestas guían el diagnóstico del maestro joyero. No hay respuesta incorrecta.
      </p>

      <div className="space-y-7 max-w-2xl">
        {questions.map((q) => {
          const value = state.draft.quizAnswers[q.key] ?? "";
          if (q.type === "options") {
            return (
              <fieldset key={q.key}>
                <legend className="block font-serif text-ivory text-lg mb-3 leading-snug">
                  {q.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = value === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setQuizAnswer(q.key, opt)}
                        aria-pressed={selected}
                        className={
                          "px-5 py-2.5 text-sm font-light border transition-colors duration-300 cursor-pointer " +
                          (selected
                            ? "border-accent-gold bg-accent-gold-soft text-text-strong"
                            : "border-border-subtle text-text-muted hover:border-accent-gold/60 hover:text-text-strong")
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          }
          return (
            <label key={q.key} className="block">
              <span className="block font-serif text-ivory text-lg mb-3 leading-snug">
                {q.label}
              </span>
              <textarea
                value={value}
                onChange={(e) => setQuizAnswer(q.key, e.target.value)}
                rows={2}
                placeholder={q.placeholder}
                className="w-full bg-surface-0/40 border border-border-subtle px-4 py-3 text-text-default font-light leading-relaxed focus-visible:outline-none focus-visible:border-accent-gold transition-colors duration-300 resize-y"
              />
            </label>
          );
        })}
      </div>

      <Step3FeelingChips />

      <div className="mt-10 flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
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
          className="inline-flex items-center gap-4 px-9 py-3.5 border border-accent-gold text-accent-gold font-sans text-[0.68rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0 transition-colors duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-gold"
        >
          Continuar
          <span aria-hidden>→</span>
        </button>
      </div>
    </motion.div>
  );
}
