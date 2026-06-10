"use client";

import { MessageCircle, CalendarCheck } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/constants";
import { track } from "@/lib/analytics";

/**
 * Botones flotantes inferiores derechos:
 *  - "Agenda tu diagnóstico" → scroll suave al formulario.
 *  - WhatsApp directo.
 * Ambos expanden el texto al hover (desktop) y permanecen compactos en mobile.
 */
const WA_MESSAGE =
  "Hola DuJoyero, vi su sitio y quiero hablar con un asesor sobre mi joya.";

export function FloatingButtons() {
  const waUrl = buildWhatsAppUrl(WA_MESSAGE);

  return (
    <div
      className="fixed bottom-5 right-4 md:bottom-8 md:right-6 flex flex-col gap-2.5 z-[800] print:hidden"
      aria-label="Acciones rápidas"
    >
      <a
        href="#diagnostico"
        data-cta-section="floating"
        data-cta-label="agenda_diagnostico"
        onClick={() => track("cta_clicked", { section: "floating", label: "agenda_diagnostico" })}
        className="group flex items-center gap-2.5 px-3.5 py-3 rounded-full border border-accent-gold/40 bg-surface-0/85 backdrop-blur-md text-accent-gold text-[0.68rem] tracking-[0.18em] uppercase font-light max-w-[3rem] hover:max-w-[15rem] overflow-hidden whitespace-nowrap transition-[max-width,background,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-2/95 hover:border-accent-gold hover:shadow-[0_0_28px_oklch(65%_0.096_72/0.4)] cursor-pointer"
        aria-label="Agendar diagnóstico"
      >
        <CalendarCheck className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Agendar diagnóstico
        </span>
      </a>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cta-section="floating"
        data-cta-label="whatsapp"
        onClick={() => track("cta_clicked", { section: "floating", label: "whatsapp" })}
        className="group flex items-center gap-2.5 px-3.5 py-3 rounded-full border border-accent-gold/40 bg-surface-0/85 backdrop-blur-md text-accent-gold text-[0.68rem] tracking-[0.18em] uppercase font-light max-w-[3rem] hover:max-w-[12rem] overflow-hidden whitespace-nowrap transition-[max-width,background,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-surface-2/95 hover:border-accent-gold hover:shadow-[0_0_28px_oklch(65%_0.096_72/0.4)] cursor-pointer"
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} aria-hidden />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Hablar por WhatsApp
        </span>
      </a>
    </div>
  );
}
