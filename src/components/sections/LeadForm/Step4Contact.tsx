"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Loader2 } from "lucide-react";
import { useLeadForm } from "./leadFormContext";
import { COPY } from "@/lib/constants";
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

export function Step4Contact() {
  const reduce = useReducedMotion();
  const { state, setContact, go, submitStart, submitDone, submitFail } =
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

    const payload = {
      name: data.name.trim(),
      phone: data.phone,
      email: data.email?.trim() ?? "",
      service: state.draft.service,
      feeling: state.draft.feeling,
      quizAnswers: state.draft.quizAnswers,
      photoDataUrl: state.draft.photoUrl ?? undefined,
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
        // Guardar payload en sessionStorage para reintento manual (Fase E).
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
      <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.2] mb-3">
        ¿Cómo te contactamos?
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-8">
        Apenas confirmes estos datos, preparamos tu cita y te enviamos los
        próximos pasos por WhatsApp.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-xl"
        noValidate
      >
        <label className="block">
          <span className="block font-serif text-ivory text-lg mb-2">
            Nombre completo
          </span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Ej. María González"
            {...register("name")}
            className="gold-focus w-full bg-surface-0/40 border border-border-subtle rounded-md px-4 py-3 text-text-default font-light focus-visible:outline-none placeholder:text-text-muted/55"
          />
          {errors.name && (
            <span className="block text-sm text-red-300 mt-1.5 font-light">
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="block font-serif text-ivory text-lg mb-2">
            Número de celular
          </span>
          <div className="phone-input-wrap bg-surface-0/40 border border-border-subtle rounded-md focus-within:border-accent-gold transition-colors">
            <PhoneInput
              international
              defaultCountry="US"
              placeholder="305 123 4567"
              value={phoneValue || undefined}
              onChange={(v) => setValue("phone", v ?? "", { shouldValidate: true })}
              numberInputProps={{
                className:
                  "w-full bg-transparent px-4 py-3 text-text-default font-light focus-visible:outline-none border-0 placeholder:text-text-muted/55",
              }}
              countrySelectProps={{
                "aria-label": "Selecciona el código de país",
              }}
              className="flex items-center gap-2 px-3"
            />
          </div>
          {errors.phone && (
            <span className="block text-sm text-red-300 mt-1.5 font-light">
              {errors.phone.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="block font-serif text-ivory text-lg mb-2">
            Email <span className="text-red-400 not-italic" aria-hidden="true">*</span>
            <span className="sr-only">(obligatorio)</span>
          </span>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            aria-required="true"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
            className="gold-focus w-full bg-surface-0/40 border border-border-subtle rounded-md px-4 py-3 text-text-default font-light focus-visible:outline-none placeholder:text-text-muted/55"
          />
          {errors.email && (
            <span className="block text-sm text-red-300 mt-1.5 font-light" role="alert">
              {errors.email.message}
            </span>
          )}
        </label>

        {submitError && (
          <p className="text-sm text-red-300 font-light" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => go("quiz")}
            disabled={isSubmitting}
            className="text-[0.65rem] tracking-[0.22em] uppercase text-text-muted hover:text-accent-gold transition-colors cursor-pointer self-start"
          >
            ← Volver al quiz
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-3 px-9 py-3.5 border border-accent-gold bg-accent-gold text-surface-0 font-sans text-[0.68rem] tracking-[0.25em] uppercase hover:bg-gold-l transition-colors duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Enviando…
              </>
            ) : (
              <>
                Continuar
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </form>

      {state.submitted && state.draft.name && (
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          className="mt-10 p-6 border border-accent-gold/40 bg-accent-gold-soft max-w-xl"
        >
          <p className="text-text-default font-light leading-[1.8]">
            {COPY.form.contact.reassurance(state.draft.name.split(" ")[0])}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
