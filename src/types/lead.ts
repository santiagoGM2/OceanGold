import type { Feeling, ServiceId } from "@/lib/constants";

export type QuizAnswers = Record<string, string>;

export type LeadDraft = {
  service: ServiceId | null;
  photoUrl: string | null;
  photoUploaded: boolean;
  quizAnswers: QuizAnswers;
  feeling: Feeling | null;
  name: string;
  phone: string;
  email: string;
};

/**
 * Contrato del webhook GHL. Confirmado con el equipo de Ocean Gold:
 *
 * - `service` viaja en lowercase sin tildes (mapper en /api/lead lo garantiza).
 * - `feeling` se duplica en raíz Y dentro de `quizAnswers` para que GHL pueda
 *   mapearlo al custom field "Sentimiento" sin parsear JSON.
 * - `quizAnswers` viaja como STRING JSON serializado.
 */
export type LeadPayload = {
  name: string;
  phone: string;
  email: string;
  service: string;
  photoUrl: string;
  quizAnswers: string;
  feeling: string;
  source: "landing";
  timestamp: string;
};
