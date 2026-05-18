"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { motion, useReducedMotion } from "motion/react";
import { useLeadForm } from "./leadFormContext";
import {
  GHL_CALENDAR_URL,
  buildPostBookingWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Calendar embed de GoHighLevel.
 * - iframe con `data-src` lazy + form_embed.js de GHL con next/script lazyOnload.
 * - Pre-fill via query string (name/email/phone).
 * - Listener `postMessage` para capturar el booking confirmado y disparar WhatsApp redirect.
 */
export function Step5Calendar() {
  const reduce = useReducedMotion();
  const { state, setBooking } = useLeadForm();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const redirectedRef = useRef(false);

  // URL con prefill.
  const url = new URL(GHL_CALENDAR_URL);
  if (state.draft.name) url.searchParams.set("first_name", state.draft.name.split(" ")[0]);
  if (state.draft.name) url.searchParams.set("last_name", state.draft.name.split(" ").slice(1).join(" "));
  if (state.draft.email) url.searchParams.set("email", state.draft.email);
  if (state.draft.phone) url.searchParams.set("phone", state.draft.phone);
  const calendarSrc = url.toString();

  // Listener postMessage de GHL para detectar booking confirmado.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      try {
        const data: unknown = e.data;
        if (!data || typeof data !== "object") return;
        const obj = data as Record<string, unknown>;
        // GHL emite eventos del tipo { type: "appointment.scheduled", payload: {...} }
        // o messages más cortos con { event: "form_submission_success" }.
        const type =
          (typeof obj.type === "string" && obj.type) ||
          (typeof obj.event === "string" && obj.event) ||
          "";
        const looksLikeBooking =
          /appointment|booking|form_submission/i.test(type);
        if (!looksLikeBooking) return;

        // Intentar extraer day/time del payload.
        const payload = (obj.payload ?? obj) as Record<string, unknown>;
        const rawDate =
          (typeof payload.startTime === "string" && payload.startTime) ||
          (typeof payload.appointmentDate === "string" && payload.appointmentDate) ||
          (typeof payload.start === "string" && payload.start) ||
          "";
        let day: string | null = null;
        let time: string | null = null;
        if (rawDate) {
          const d = new Date(rawDate);
          if (!Number.isNaN(d.getTime())) {
            day = d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
            time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
          }
        }
        if (day) setBooking(day, time ?? "");
        track("booking_completed", { day: day ?? undefined, time: time ?? undefined });

        // Redirect a WhatsApp con mensaje compuesto.
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          const message = buildPostBookingWhatsAppMessage({
            feeling: state.draft.feeling,
            day,
            time,
          });
          const waUrl = buildWhatsAppUrl(message);
          track("whatsapp_redirect");
          // Pequeño delay para que el usuario vea la confirmación dentro del iframe.
          setTimeout(() => {
            window.location.href = waUrl;
          }, 2500);
        }
      } catch {
        // Ignorar mensajes que no sean del calendar.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setBooking, state.draft.feeling]);

  // Manual redirect fallback si GHL no emite postMessage.
  const fallbackRedirect = () => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    const message = buildPostBookingWhatsAppMessage({
      feeling: state.draft.feeling,
      day: state.bookingDay,
      time: state.bookingTime,
    });
    const waUrl = buildWhatsAppUrl(message);
    track("whatsapp_redirect");
    window.location.href = waUrl;
  };

  return (
    <motion.div
      key="step5"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.2] mb-3">
        Elige tu horario
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-8">
        Reserva 10–20 minutos contigo. Atendemos lunes a sábado, 12:00 PM – 7:00 PM (Miami).
      </p>

      <div className="relative w-full min-h-[640px] border border-border-subtle bg-surface-1/40">
        <iframe
          ref={iframeRef}
          src={calendarSrc}
          title="Agenda tu diagnóstico Ocean Gold"
          className="w-full min-h-[640px] block"
          style={{ border: "none" }}
          onLoad={() => {
            setIframeLoaded(true);
            track("calendar_loaded");
          }}
        />
        {!iframeLoaded && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-text-muted text-sm font-light italic">
              Cargando calendario…
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-[0.78rem] text-text-muted font-light italic max-w-md">
          Tras confirmar tu hora te conectaremos por WhatsApp para coordinar la
          recepción de la pieza.
        </p>
        <button
          type="button"
          onClick={fallbackRedirect}
          className="text-[0.65rem] tracking-[0.22em] uppercase text-accent-gold hover:underline cursor-pointer self-start sm:self-auto"
        >
          Ya agendé, ir a WhatsApp →
        </button>
      </div>

      {/* form_embed.js de GHL (necesario para que algunos eventos del iframe funcionen). */}
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="lazyOnload"
      />
    </motion.div>
  );
}

