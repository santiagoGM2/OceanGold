"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, Upload, X } from "lucide-react";
import { useLeadForm } from "./leadFormContext";
import { COPY } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_DIM = 1600;
const QUALITY = 0.85;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("img_error"));
    i.src = dataUrl;
  });
  const ratio = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_ctx");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", QUALITY);
}

export function Step2Photo() {
  const reduce = useReducedMotion();
  const { state, setPhoto, clearPhoto, go } = useLeadForm();
  const isPersonalizacion = state.draft.service === "personalizacion";

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError("Formato no soportado. Usa JPG, PNG o WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("La imagen supera 10 MB. Comprime y vuelve a intentarlo.");
        return;
      }
      setProcessing(true);
      try {
        const compressed = await compressImage(file);
        setPhoto(compressed);
        // No avanzamos automáticamente: AhaReveal toma el control en el step "aha".
        track("form_step_completed", { step_number: 2, step_name: "photo" });
        go("aha");
      } catch {
        setError("No pudimos procesar la imagen. Intenta con otra foto.");
      } finally {
        setProcessing(false);
      }
    },
    [setPhoto, go]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <motion.div
      key="step2"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
    >
      <h3 className="font-serif text-[clamp(1.6rem,2.4vw,2.2rem)] text-ivory font-light leading-[1.2] mb-3">
        {isPersonalizacion ? COPY.form.photo.titlePersonalizacion : COPY.form.photo.title}
      </h3>
      <p className="text-text-muted font-light max-w-xl mb-6">
        Una foto clara nos permite preparar mejor tu diagnóstico. Aceptamos JPG, PNG y WebP hasta 10 MB.
      </p>

      {!state.draft.photoUrl ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={
            "block border border-dashed cursor-pointer p-10 md:p-14 text-center transition-all duration-300 " +
            (dragOver
              ? "border-accent-gold bg-accent-gold-soft"
              : "border-border-subtle hover:border-accent-gold/60 bg-surface-0/40")
          }
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onInputChange}
            className="sr-only"
            aria-label="Subir foto de la joya"
          />
          <div className="flex flex-col items-center gap-3">
            {processing ? (
              <>
                <Loader2 className="w-8 h-8 text-accent-gold animate-spin" strokeWidth={1.5} />
                <span className="font-serif text-accent-gold italic text-lg">
                  {COPY.form.photo.analyzing}
                </span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-accent-gold" strokeWidth={1.25} />
                <span className="font-serif text-ivory text-lg">
                  Suelta tu foto aquí
                </span>
                <span className="text-[0.85rem] text-text-muted font-light">
                  o haz click para seleccionar desde tu dispositivo
                </span>
                {isPersonalizacion && (
                  <span className="text-[0.78rem] text-text-muted font-light italic mt-1">
                    Opcional: puedes saltarlo si aún no tienes referencia visual.
                  </span>
                )}
              </>
            )}
          </div>
        </label>
      ) : (
        <div className="relative inline-block">
          <Image
            src={state.draft.photoUrl}
            alt="Foto cargada"
            width={400}
            height={300}
            className="border border-accent-gold/40 object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={clearPhoto}
            aria-label="Quitar foto"
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface-0/80 border border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-surface-0 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-300 font-light" role="alert">
          {error}
        </p>
      )}

      {isPersonalizacion && !state.draft.photoUrl && !processing && (
        <button
          type="button"
          onClick={() => {
            track("form_step_completed", { step_number: 2, step_name: "photo-skip" });
            go("aha");
          }}
          className="mt-6 text-[0.7rem] tracking-[0.22em] uppercase text-text-muted hover:text-accent-gold underline-offset-4 hover:underline cursor-pointer"
        >
          Continuar sin foto →
        </button>
      )}
    </motion.div>
  );
}
