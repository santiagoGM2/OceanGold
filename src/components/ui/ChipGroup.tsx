"use client";

/**
 * ChipGroup — primitivo de selección por chips, single o multi.
 *
 * - `multiSelect`: true para multi (toggle), false para single (radio-like).
 * - `hasOther`: añade un chip "Otro" al final; cuando se selecciona,
 *   despliega un input de texto libre debajo del grupo.
 * - Microinteracciones Emil Kowalski: `whileTap` scale 0.97, `whileHover`
 *   scale 1.02, easing `cubic-bezier(0.32, 0.72, 0, 1)` a 200ms.
 * - Accesibilidad: cada chip es `<button role="button" aria-pressed>`.
 *   Soporta keyboard nav nativa (Tab + Space/Enter).
 * - Respeta `prefers-reduced-motion`.
 */

import { useId, useRef, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const OTRO = "Otro";
const EMIL_EASE = [0.32, 0.72, 0, 1] as const;

export interface ChipGroupProps {
  question: string;
  /** Opciones visibles (sin incluir "Otro" — ese se añade con `hasOther`). */
  options: readonly string[];
  multiSelect: boolean;
  hasOther?: boolean;
  required?: boolean;
  /** Etiquetas seleccionadas. En single-select, longitud 0 o 1. */
  value: readonly string[];
  /** Texto libre cuando "Otro" está seleccionado. */
  otherText?: string;
  onChange: (values: string[], otherText?: string) => void;
}

export function ChipGroup({
  question,
  options,
  multiSelect,
  hasOther = false,
  required = false,
  value,
  otherText = "",
  onChange,
}: ChipGroupProps) {
  const reduce = useReducedMotion();
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const otherSelected = hasOther && value.includes(OTRO);

  // Foco al input al desplegar "Otro" (sólo cuando se acaba de seleccionar).
  const wasOtherRef = useRef(otherSelected);
  useEffect(() => {
    if (otherSelected && !wasOtherRef.current && inputRef.current) {
      inputRef.current.focus();
    }
    wasOtherRef.current = otherSelected;
  }, [otherSelected]);

  const isSelected = (opt: string) => value.includes(opt);

  const toggle = (opt: string) => {
    if (multiSelect) {
      const next = isSelected(opt)
        ? value.filter((v) => v !== opt)
        : [...value, opt];
      // Si se deselecciona "Otro", limpiar el texto libre.
      const nextOther = opt === OTRO && !next.includes(OTRO) ? "" : otherText;
      onChange(next, nextOther);
      return;
    }
    // Single-select: reemplazar.
    if (isSelected(opt)) {
      onChange([], opt === OTRO ? "" : otherText);
    } else {
      onChange([opt], opt === OTRO ? otherText : "");
    }
  };

  const allChips = hasOther ? [...options, OTRO] : options;
  const selectedCount = value.length;

  const chipVariants: Variants = {
    rest: { scale: 1 },
    hover: reduce ? {} : { scale: 1.02 },
    tap: reduce ? {} : { scale: 0.97 },
  };

  return (
    <fieldset className="block">
      <legend className="block font-serif text-text-strong text-[clamp(1.1rem,1.6vw,1.35rem)] mb-4 leading-snug">
        {question}
        {required && (
          <span className="ml-1.5 text-accent-gold" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <div className="flex flex-wrap gap-2.5" role="group">
        {allChips.map((opt) => {
          const selected = isSelected(opt);
          const label = opt === OTRO ? "Otro" : opt;
          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              aria-pressed={selected}
              aria-label={`${selected ? "Deseleccionar" : "Seleccionar"} ${label}`}
              variants={chipVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              transition={{ duration: 0.2, ease: EMIL_EASE }}
              className={
                "inline-flex items-center px-5 py-3 rounded-lg border-[1.5px] " +
                "text-[0.92rem] font-light tracking-wide cursor-pointer " +
                "transition-[background-color,border-color,box-shadow,color] duration-200 " +
                (selected
                  ? "border-accent-gold bg-accent-gold-soft text-text-strong " +
                    "shadow-[0_0_22px_oklch(65%_0.096_72/0.25)]"
                  : "border-border-subtle bg-surface-1/60 text-text-muted " +
                    "hover:border-accent-gold/55 hover:text-text-strong")
              }
              style={{
                // Garantiza que el bezier Emil aplique aún cuando Tailwind
                // genere transition con su default ease.
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      {hasOther && (
        <AnimatePresence initial={false}>
          {otherSelected && (
            <motion.div
              key="other-input"
              initial={reduce ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EMIL_EASE }}
              className="overflow-hidden"
            >
              <label htmlFor={inputId} className="sr-only">
                Detalle de tu respuesta
              </label>
              <textarea
                id={inputId}
                ref={inputRef}
                value={otherText}
                onChange={(e) => onChange([...value], e.target.value)}
                rows={2}
                placeholder="Cuéntanos…"
                className={
                  "mt-4 w-full bg-surface-0/40 border border-border-subtle rounded-lg " +
                  "px-4 py-3 text-text-default font-light leading-relaxed resize-y " +
                  "focus-visible:outline-none focus-visible:border-accent-gold transition-colors duration-200"
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {multiSelect && selectedCount > 0 && (
        <p
          className="mt-3 text-[0.72rem] tracking-[0.18em] uppercase text-text-muted font-light"
          aria-live="polite"
        >
          {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
        </p>
      )}
    </fieldset>
  );
}
