/**
 * Helpers para enviar leads a GoHighLevel.
 * - Mapper que garantiza `service` en lowercase sin tildes (contract con GHL).
 * - Retry 3x con backoff exponencial.
 * - `feeling` se duplica en raíz Y en quizAnswers (intencional, ver README).
 * - `quizAnswers` se envía como STRING JSON serializado.
 */
import type { Feeling, ServiceId } from "@/lib/constants";
import type { LeadPayload, QuizAnswers } from "@/types/lead";

/**
 * Los IDs en `SERVICES` ya están en lowercase sin tildes, pero validamos
 * por si en el futuro se renombran.
 */
const SERVICE_MAP: Record<ServiceId, string> = {
  reparacion: "reparacion",
  transformacion: "transformacion",
  personalizacion: "personalizacion",
  mantenimiento: "mantenimiento",
  armado: "armado",
  diagnostico: "diagnostico",
};

export function normalizeService(service: ServiceId): string {
  return SERVICE_MAP[service] ?? service;
}

export function buildGhlPayload(input: {
  name: string;
  phone: string;
  email: string;
  service: ServiceId;
  photoUrl: string;
  quizAnswers: QuizAnswers;
  feeling: Feeling;
}): LeadPayload {
  const quizWithFeeling: QuizAnswers = {
    ...input.quizAnswers,
    feeling: input.feeling,
  };
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    service: normalizeService(input.service),
    photoUrl: input.photoUrl,
    quizAnswers: JSON.stringify(quizWithFeeling),
    feeling: input.feeling,
    source: "landing",
    timestamp: new Date().toISOString(),
  };
}

/**
 * POST al webhook GHL con retry exponencial.
 * Retorna `{ ok, status, retries }`.
 */
export async function postLeadToGhl(
  payload: LeadPayload,
  webhookUrl: string,
  maxAttempts = 3
): Promise<{ ok: boolean; status: number; retries: number; error?: string }> {
  let attempt = 0;
  let lastError: string | undefined;
  let lastStatus = 0;
  while (attempt < maxAttempts) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      lastStatus = res.status;
      if (res.ok) {
        return { ok: true, status: res.status, retries: attempt };
      }
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "network error";
    }
    attempt++;
    if (attempt < maxAttempts) {
      const backoff = 250 * Math.pow(2, attempt - 1); // 250, 500, 1000ms
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  return { ok: false, status: lastStatus, retries: attempt, error: lastError };
}
