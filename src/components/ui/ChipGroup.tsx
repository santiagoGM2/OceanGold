"use client";

/**
 * ChipGroup — primitivo de selección por chips, single o multi.
 *
 * Rediseño F.8 (Impeccable pass): el grupo ya no es texto plano + chips.
 * Estructura editorial:
 *   - Legend question en serif, con hint label debajo ("Elige todas las que
 *     apliquen" / "Elige una") en gold-soft italic.
 *   - Chips con entrance stagger (aparecen secuencialmente en mount).
 *   - Estado selected: lift -3y + disco dorado con ✓ a la izquierda
 *     (padding-left animado para no shiftear layout).
 *   - Selected count se convierte en una "pill" dorada al pie del grupo —
 *     reward visual de progreso, no solo texto muted.
 *
 * Microinteracciones Emil Kowalski: `whileTap` scale 0.96, `whileHover`
 * scale 1.02, easing `cubic-bezier(0.32, 0.72, 0, 1)` a 220ms.
 *
 * Accesibilidad: cada chip es `<button aria-pressed>`. Soporta keyboard nav
 * nativa (Tab + Space/Enter). Respeta `prefers-reduced-motion`.
 */

import { useId, useRef, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Check } from "lucide-react";

const OTRO = "Otro";
const EMIL_EASE = [0.32, 0.72, 0, 1] as const;
const ENTER_EASE = [0.16, 1, 0.3, 1] as const;

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
      const nextOther = opt === OTRO && !next.includes(OTRO) ? "" : otherText;
      onChange(next, nextOther);
      return;
    }
    if (isSelected(opt)) {
      onChange([], opt === OTRO ? "" : otherText);
    } else {
      onChange([opt], opt === OTRO ? otherText : "");
    }
  };

  const allChips = hasOther ? [...options, OTRO] : options;
  const selectedCount = value.length;

  // Variants del estado selected/hover/tap del chip individual. Combinamos
  // `animate={selected ? "selected" : "rest"}` con `whileHover` / `whileTap`.
  const chipStateVariants: Variants = {
    rest: { y: 0, scale: 1 },
    selected: { y: reduce ? 0 : -3, scale: 1 },
    hover: reduce ? {} : { scale: 1.02 },
    tap: reduce ? {} : { scale: 0.96 },
  };

  // Variants de entrada con stagger — chips aparecen secuencialmente al
  // montar. El stagger sólo corre en el initial mount, no en re-renders
  // por cambio de selección.
  const chipsContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.05,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  const chipEnter: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: ENTER_EASE },
    },
  };

  const hint = multiSelect
    ? "Elige todas las que apliquen."
    : "Elige una opción.";

  return (
    <fieldset className="block">
      <legend className="block font-serif text-ivory text-[clamp(1.1rem,1.6vw,1.35rem)] mb-2 leading-snug">
        {question}
        {required && (
          <span className="ml-1.5 text-accent-gold" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      {/* Hint italic debajo de la pregunta — explica el modo de selección
          sin recurrir a iconos genéricos. Pequeña pero refuerza la sinergia
          editorial. */}
      <p className="text-[0.78rem] text-accent-gold/85 font-light italic mb-5 leading-snug">
        {hint}
      </p>

      <motion.div
        className="flex flex-wrap gap-2.5"
        role="group"
        variants={chipsContainer}
        initial="hidden"
        animate="visible"
      >
        {allChips.map((opt) => {
          const selected = isSelected(opt);
          const label = opt === OTRO ? "Otro" : opt;
          return (
            <motion.div key={opt} variants={chipEnter} className="inline-block">
              <motion.button
                type="button"
                onClick={() => toggle(opt)}
                aria-pressed={selected}
                aria-label={`${selected ? "Deseleccionar" : "Seleccionar"} ${label}`}
                variants={chipStateVariants}
                initial="rest"
                animate={selected ? "selected" : "rest"}
                whileHover="hover"
                whileTap="tap"
                transition={{ duration: 0.22, ease: EMIL_EASE }}
                className={
                  "relative inline-flex items-center rounded-lg border-[1.5px] " +
                  "text-[0.92rem] font-light tracking-wide cursor-pointer py-3 " +
                  "transition-[background-color,border-color,box-shadow,color,padding-left,padding-right] duration-200 " +
                  (selected
                    ? "pl-10 pr-5 border-accent-gold bg-accent-gold-soft text-ivory " +
                      "shadow-[0_10px_28px_oklch(65%_0.096_72/0.32),0_2px_6px_oklch(65%_0.096_72/0.2)]"
                    : "px-5 border-border-subtle bg-surface-1/55 text-text-default " +
                      "hover:border-accent-gold/60 hover:bg-surface-1/80 hover:text-ivory hover:shadow-[0_6px_18px_oklch(0%_0_0/0.25)]")
                }
                style={{
                  transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                <AnimatePresence initial={false}>
                  {selected && (
                    <motion.span
                      key="check"
                      initial={
                        reduce
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.3 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.3 }
                      }
                      transition={{ duration: 0.22, ease: EMIL_EASE }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-accent-gold"
                      aria-hidden
                    >
                      <Check
                        className="w-[10px] h-[10px] text-surface-0"
                        strokeWidth={3.5}
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
                {label}
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

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

      {/* Selected count "pill" dorada — recompensa visual al progreso.
          Sólo aparece en multi-select con al menos una elegida. */}
      <AnimatePresence initial={false}>
        {multiSelect && selectedCount > 0 && (
          <motion.div
            key="selected-pill"
            initial={
              reduce
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 6, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.96 }
            }
            transition={{ duration: 0.3, ease: EMIL_EASE }}
            className="mt-5 inline-flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-accent-gold/12 border border-accent-gold/35"
            aria-live="polite"
          >
            <span className="font-serif text-[0.95rem] text-accent-gold leading-none">
              {selectedCount}
            </span>
            <span className="text-[0.66rem] tracking-[0.22em] uppercase text-accent-gold/90 font-medium">
              {selectedCount === 1 ? "elegida" : "elegidas"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </fieldset>
  );
}
