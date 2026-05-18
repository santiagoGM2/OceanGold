"use client";

import dynamic from "next/dynamic";
import { BUSINESS } from "@/lib/constants";

/**
 * Skeleton del LeadForm. Mantiene el mismo id="diagnostico" y altura mínima
 * que el form real para evitar CLS cuando hidrata. Si el usuario hizo scroll
 * antes de la hidratación o si Situations llamó selectService(), el scroll
 * landa aquí sin saltos.
 */
function LeadFormSkeleton() {
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

        <div className="border border-border-subtle bg-surface-1/60 backdrop-blur-sm p-6 md:p-10 min-h-[480px] md:min-h-[560px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-text-muted">
            <span
              className="w-8 h-8 rounded-full border border-accent-gold/60 border-t-accent-gold animate-spin"
              aria-hidden
            />
            <span className="text-[0.7rem] tracking-[0.28em] uppercase font-light">
              Preparando tu diagnóstico…
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ssr: true (default) — el form se renderea en SSR (HTML inicial completo)
// pero su bundle JS se aísla en su propio chunk (code-splitting). Probar con
// `ssr: false` resultó en LCP 5.3s vs 4.4s — el chunk del form se descargaba
// post-FCP bloqueando el main thread.
const LeadForm = dynamic(
  () => import("./index").then((m) => ({ default: m.LeadForm })),
  {
    loading: LeadFormSkeleton,
  }
);

export default LeadForm;
