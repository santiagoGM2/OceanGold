"use client";

/**
 * Step 4 — Captura de contacto.
 *
 * Rediseño F.8: estructura editorial con:
 *   1. Header con eyebrow + título + body — más generoso en tipografía.
 *   2. Mini-timeline numerada 01 → 02 → 03 que explica el flujo
 *      post-submit. Reemplaza el "trust strip" anterior (que se sentía
 *      genérico con iconos). Los conectores en línea fina dorada le dan
 *      lectura cinematográfica.
 *   3. Form en grid 2-col responsive con tipografía e inputs más amplios.
 *   4. CTA sólido dorado.
 *
 * Removido: pill de "tus datos están encriptados" y línea inferior con
 * candado. La confianza la cargan ahora las 23 años de oficio (visibles
 * en el Hero y Authority).
 */

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Loader2 } from "lucide-react";
import { useLeadForm } from "./leadFormContext";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre completo"),
  phone: z
    .string()
    .min(6, "Ingresa un número válido")
    .refine((v) => isValidPhoneNumber(v), "Número de teléfono inválido"),
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email")
    .email("Email inválido"),
});

type ContactValues = z.infer<typeof ContactSchema>;

// Timeline editorial — 3 pasos numerados. Reemplaza el trust strip de
// pills con iconos genéricos. Cada paso tiene un número grande (Cinzel
// gold) + descripción corta. Conectores en línea fina dorada entre pasos.
const FLOW_STEPS = [
  { n: "01", text: "Tu diagnóstico queda confirmado al instante" },
  { n: "02", text: "Un maestro joyero te escribe por WhatsApp en minutos" },
  { n: "03", text: "Coordinan juntos la recepción de tu pieza" },
] as const;

export function Step4Contact() {
  const reduce = useReducedMotion();
  const { state, setContact, go, submitStart, submitDone, submitFail, buildPayload } =
    useLeadForm();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: state.draft.name || "",
      phone: state.draft.phone || "",
      email: state.draft.email || "",
    },
  });

  const phoneValue = watch("phone");

  const onSubmit = async (data: ContactValues) => {
    setSubmitError(null);
    setContact(data.name.trim(), data.phone, data.email?.trim() ?? "");
    submitStart();

    // `buildPayload()` aplana el quizAnswers interno (rich shape
    // { values, otherText }) a Record<string, string> que es lo que
    // valida `LeadInputSchema` en /api/lead.
    const base = buildPayload();
    const payload = {
      name: data.name.trim(),
      phone: data.phone,
      email: data.email?.trim() ?? "",
      service: base.service,
      feeling: base.feeling,
      quizAnswers: base.quizAnswers,
      photoDataUrl: base.photoUrl ?? undefined,
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        track("lead_submitted_to_ghl", {
          success: false,
          retry_count: json.retries ?? 0,
        });
        submitFail();
        setSubmitError(
          "Hubo un problema al enviar tus datos. Vuelve a intentarlo en un momento."
        );
        try {
          sessionStorage.setItem(
            "oceangold:pending-lead",
            JSON.stringify(payload)
          );
        } catch {}
        return;
      }
      track("lead_submitted_to_ghl", {
        success: true,
        retry_count: json.retries ?? 0,
      });
      track("form_step_completed", {
        step_number: 5,
        step_name: "contact",
      });
      submitDone();
      go("calendar");
    } catch {
      submitFail();
      track("lead_submitted_to_ghl", { success: false, retry_count: 0 });
      setSubmitError("Sin conexión. Intenta de nuevo.");
    }
  };

  return (
    <motion.div
      key="step4"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      {/* Header */}
      <div className="mb-10">
        <span className="inline-flex items-center gap-3 text-[0.62rem] tracking-[0.32em] uppercase text-accent-gold font-medium mb-4">
          <span aria-hidden className="block w-6 h-px bg-accent-gold" />
          Último paso
        </span>
        <h3 className="font-serif text-[clamp(1.85rem,3vw,2.6rem)] text-ivory font-light leading-[1.1] tracking-[-0.012em] mb-4">
          Sólo falta cómo te contactamos.
        </h3>
        <p className="text-text-default font-light text-[clamp(1rem,1.35vw,1.1rem)] leading-[1.75] max-w-xl">
          Tres datos y tu diagnóstico queda en manos de nuestros maestros
          joyeros. Te escribimos por WhatsApp para coordinar los siguientes
          pasos.
        </p>
      </div>

      {/* Timeline editorial — 3 pasos numerados conectados por línea dorada.
          Horizontal en sm+, vertical en mobile. Reemplaza el strip de pills. */}
      <ol className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-2 mb-12 max-w-4xl list-none">
        {FLOW_STEPS.map((step, i) => (
          <li
            key={step.n}
            className="flex-1 flex sm:block items-start gap-4 sm:gap-0"
          >
            <div className="flex items-center gap-3 mb-0 sm:mb-3">
              <span className="font-serif text-[1.05rem] sm:text-[1.15rem] font-light text-accent-gold tracking-wider flex-shrink-0">
                {step.n}
              </span>
              {/* Conector dorado horizontal — sólo en sm+ y no en el último */}
              {i < FLOW_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="hidden sm:block h-px flex-1 bg-gradient-to-r from-accent-gold/70 via-accent-gold/30 to-transparent"
                />
              )}
            </div>
            <span className="block text-[0.82rem] sm:text-[0.84rem] text-ivory/85 font-light leading-[1.55] sm:pr-6">
              {step.text}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-5">
          {/* Name */}
          <label className="block">
            <span className="block font-serif text-ivory text-[1rem] mb-2.5 font-light tracking-wide">
              Nombre completo
            </span>
            <input
              type="text"
              autoComplete="name"
              placeholder="Ej. María González"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
              className="gold-focus w-full bg-surface-0/50 border border-border-subtle rounded-md px-4 py-4 text-text-default font-light focus-visible:outline-none placeholder:text-text-muted/45 text-[1rem]"
            />
            {errors.name && (
              <span
                className="block text-sm text-red-300 mt-1.5 font-light"
                role="alert"
              >
                {errors.name.message}
              </span>
            )}
          </label>

          {/* Phone */}
          <label className="block">
            <span className="block font-serif text-ivory text-[1rem] mb-2.5 font-light tracking-wide">
              Celular
            </span>
            <div className="phone-input-wrap bg-surface-0/50 border border-border-subtle rounded-md focus-within:border-accent-gold focus-within:shadow-[0_0_0_3px_oklch(65%_0.096_72/0.18),0_0_24px_oklch(65%_0.096_72/0.25)] transition-[border-color,box-shadow] duration-300">
              <PhoneInput
                international
                defaultCountry="US"
                placeholder="305 123 4567"
                value={phoneValue || undefined}
                onChange={(v) =>
                  setValue("phone", v ?? "", { shouldValidate: true })
                }
                numberInputProps={{
                  className:
                    "w-full bg-transparent px-4 py-4 text-text-default font-light focus-visible:outline-none border-0 placeholder:text-text-muted/45 text-[1rem]",
                }}
                countrySelectProps={{
                  "aria-label": "Selecciona el código de país",
                }}
                className="flex items-center gap-2 px-3"
              />
            </div>
            {errors.phone && (
              <span
                className="block text-sm text-red-300 mt-1.5 font-light"
                role="alert"
              >
                {errors.phone.message}
              </span>
            )}
          </label>
        </div>

        {/* Email full-width */}
        <label className="block mb-7">
          <span className="block font-serif text-ivory text-[1rem] mb-2.5 font-light tracking-wide">
            Email
            <span className="text-accent-gold/85 font-sans text-[0.58rem] tracking-[0.22em] uppercase ml-2 font-medium">
              Requerido
            </span>
          </span>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            aria-required="true"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
            className="gold-focus w-full bg-surface-0/50 border border-border-subtle rounded-md px-4 py-4 text-text-default font-light focus-visible:outline-none placeholder:text-text-muted/45 text-[1rem]"
          />
          {errors.email && (
            <span
              className="block text-sm text-red-300 mt-1.5 font-light"
              role="alert"
            >
              {errors.email.message}
            </span>
          )}
        </label>

        {submitError && (
          <p className="text-sm text-red-300 font-light mb-6" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => go("quiz")}
            disabled={isSubmitting}
            className="text-[0.65rem] tracking-[0.22em] uppercase text-text-muted hover:text-accent-gold transition-colors cursor-pointer self-start sm:self-auto"
          >
            ← Volver al quiz
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="gold-cta inline-flex items-center justify-center gap-3 px-9 md:px-10 py-4 border border-accent-gold bg-accent-gold text-surface-0 font-sans font-medium text-[0.72rem] tracking-[0.25em] uppercase hover:bg-gold-l transition-colors duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-wait rounded-sm shadow-[0_8px_24px_oklch(0%_0_0/0.3)]"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="w-4 h-4 animate-spin"
                  strokeWidth={2}
                  aria-hidden
                />
                Enviando…
              </>
            ) : (
              <>
                Recibir mi diagnóstico
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
