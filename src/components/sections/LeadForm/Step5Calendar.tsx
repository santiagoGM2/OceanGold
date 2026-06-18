"use client";

/**
 * Confirmación final del flujo de diagnóstico premium.
 *
 * Reemplaza al embed del calendario GHL. La conversión real ocurre al hacer
 * clic en el CTA de WhatsApp: abrimos un `wa.me` con mensaje pre-rellenado
 * que incluye el nombre y el sentimiento capturados en el quiz, de modo que
 * el asesor recibe contexto antes del primer mensaje del cliente.
 *
 * Se mantiene el export `Step5Calendar` para no tocar el routing del
 * `LeadForm` index — el step id "calendar" sigue siendo el destino final del
 * Step4, pero la UI ya no muestra un calendario.
 */

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, MessageCircle } from "lucide-react";
import { useLeadForm } from "./leadFormContext";
import { buildPostFormWhatsAppMessage, buildWhatsAppUrl } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Step5Calendar() {
  const reduce = useReducedMotion();
  const { state } = useLeadForm();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    track("form_completed_premium_ready");
  }, []);

  const message = buildPostFormWhatsAppMessage({
    name: state.draft.name,
  });
  const waUrl = buildWhatsAppUrl(message);

  return (
    <motion.div
      key="step5"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
      className="flex flex-col items-center text-center py-4 md:py-8"
    >
      {/* Check dorado con halo radial — entrada en dos tiempos
          (anillo escala, luego el ✓ aparece). Refuerza la sensación de
          "completado" sin recurrir a efectos confeti que se sienten genéricos. */}
      <motion.div
        initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.1, duration: 0.6, ease: EASE }}
        className="relative mb-9"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(65% 0.096 72 / 0.22) 0%, transparent 65%)",
            transform: "scale(1.45)",
          }}
        />
        <div
          className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-accent-gold flex items-center justify-center bg-accent-gold/[0.08]"
          style={{ boxShadow: "0 0 24px oklch(65% 0.096 72 / 0.28)" }}
        >
          <motion.span
            initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.4, duration: 0.45, ease: EASE }}
            className="inline-flex"
          >
            <Check
              className="w-12 h-12 md:w-14 md:h-14 text-accent-gold"
              strokeWidth={2.2}
              aria-hidden
            />
          </motion.span>
        </div>
      </motion.div>

      <motion.h3
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.55, duration: 0.55, ease: EASE }}
        className="font-serif text-[clamp(1.9rem,3.6vw,2.7rem)] text-ivory font-light leading-[1.12] tracking-[-0.012em] mb-5 max-w-2xl"
      >
        Tu diagnóstico está en nuestras manos.
      </motion.h3>

      <motion.p
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.7, duration: 0.55, ease: EASE }}
        className="text-text-default font-light text-[clamp(1rem,1.4vw,1.1rem)] leading-[1.8] max-w-xl mb-10"
      >
        Te conectamos con uno de nuestros maestros joyeros para coordinar los
        siguientes pasos. Pulsa el botón y te abrimos una conversación directa
        por WhatsApp.
      </motion.p>

      <motion.div
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 0.85, duration: 0.55, ease: EASE }}
        whileHover={reduce ? undefined : { scale: 1.015 }}
        whileTap={reduce ? undefined : { scale: 0.985 }}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cta-section="step5_success"
          data-cta-label="whatsapp_premium"
          onClick={() => track("whatsapp_redirect")}
          className="cta-pulse gold-cta inline-flex items-center gap-3.5 px-8 md:px-12 py-4 md:py-5 border border-accent-gold bg-accent-gold text-surface-0 font-sans text-[0.78rem] md:text-[0.84rem] tracking-[0.22em] uppercase hover:bg-gold-l transition-colors duration-300 rounded-sm"
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" strokeWidth={2} aria-hidden />
          Escribirnos por WhatsApp
          <span aria-hidden>→</span>
        </a>
      </motion.div>

      <motion.p
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.05, duration: 0.5, ease: EASE }}
        className="text-[0.78rem] text-text-muted font-light italic mt-9 max-w-md leading-[1.7]"
      >
        Te respondemos en minutos. Coordinamos los detalles de la recepción
        de tu pieza por el mismo canal.
      </motion.p>
    </motion.div>
  );
}
