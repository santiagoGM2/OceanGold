"use client";

import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useLeadForm } from "./leadFormContext";
import { ProgressBar } from "./ProgressBar";
import { Step1Service } from "./Step1Service";
import { Step2Photo } from "./Step2Photo";
import { Step2bAhaReveal } from "./Step2bAhaReveal";
import { Step3Quiz } from "./Step3Quiz";
import { Step4Contact } from "./Step4Contact";
import { Step5Calendar } from "./Step5Calendar";
import { track } from "@/lib/analytics";
import { BUSINESS } from "@/lib/constants";

export function LeadForm() {
  const { state, go } = useLeadForm();

  // form_opened — una vez por sesión (mount del form).
  useEffect(() => {
    track("form_opened");
  }, []);

  // Si el step actual es "service" pero ya hay servicio seleccionado (vino de
  // Situations), saltamos a "photo" automáticamente.
  useEffect(() => {
    if (state.step === "service" && state.draft.service) {
      go("photo");
    }
  }, [state.step, state.draft.service, go]);

  return (
    <section
      id="diagnostico"
      className="relative px-6 md:px-14 py-20 md:py-28 scroll-mt-20 border-t border-border-subtle"
    >
      <div className="max-w-7xl mx-auto">
        {/* Eyebrow prominente con marker dorado izquierdo — señal visual fuerte
            de que aquí empieza el flujo principal de conversión. */}
        <span className="inline-flex items-center gap-3 text-[0.72rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-medium">
          <span aria-hidden className="block w-7 h-px bg-accent-gold" />
          Inicia aquí · Diagnóstico gratuito · {BUSINESS.diagnosticDuration}
        </span>
        <h2 className="font-serif text-[clamp(2.2rem,4.4vw,3.85rem)] text-ivory font-light leading-[1.05] tracking-[-0.015em] mb-4">
          Tu joya merece su siguiente capítulo
        </h2>
        <p className="text-text-muted font-light text-[clamp(0.98rem,1.4vw,1.1rem)] leading-[1.75] max-w-2xl mb-10">
          Te tomará 2 minutos completar este formulario. Al final agendas tu cita
          virtual o presencial — la decides tú.
        </p>

        {/* Container del formulario con borde dorado + glow pulsante.
            La clase `lead-form-card` aplica una animación CSS que pulsa el
            box-shadow del marco, dejando claro que es el área interactiva
            principal de la página.
            Esquinas L doradas decorativas refuerzan la sensación de "marco
            artesanal" — coherente con el frame del video de El Regalo Perfecto. */}
        <div className="lead-form-card relative bg-surface-1/60 backdrop-blur-sm p-6 md:p-10 rounded-lg border border-accent-gold/45">
          <span aria-hidden className="pointer-events-none absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-accent-gold rounded-tl-md" />
          <span aria-hidden className="pointer-events-none absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-accent-gold rounded-tr-md" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-accent-gold rounded-bl-md" />
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-accent-gold rounded-br-md" />

          <ProgressBar current={state.step} />

          <AnimatePresence mode="wait" initial={false}>
            {state.step === "service" && <Step1Service key="step1" />}
            {state.step === "photo" && <Step2Photo key="step2" />}
            {state.step === "aha" && <Step2bAhaReveal key="step2b" />}
            {state.step === "quiz" && <Step3Quiz key="step3" />}
            {state.step === "contact" && <Step4Contact key="step4" />}
            {state.step === "calendar" && <Step5Calendar key="step5" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
