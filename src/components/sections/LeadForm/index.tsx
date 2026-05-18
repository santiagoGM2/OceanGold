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
        <span className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light">
          Diagnóstico gratuito · {BUSINESS.diagnosticDuration}
        </span>
        <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[0.02em] mb-3">
          Tu joya merece su siguiente capítulo
        </h2>
        <p className="text-text-muted font-light max-w-2xl mb-10">
          Te tomará 2 minutos completar este formulario. Al final agendas tu cita
          virtual o presencial — la decides tú.
        </p>

        <div className="border border-border-subtle bg-surface-1/60 backdrop-blur-sm p-6 md:p-10">
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
