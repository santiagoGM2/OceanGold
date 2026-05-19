import type { Feeling, ServiceId } from "@/lib/constants";

/** Estado interno por pregunta del quiz (multi/single + texto "Otro"). */
export type QuizFieldState = {
  values: string[];
  otherText: string;
};

/** Estado interno del formulario: el quiz tiene shape rica. */
export type QuizState = Record<string, QuizFieldState>;

/** Payload aplanado que se envía al API/GHL: clave → string single-line. */
export type QuizAnswers = Record<string, string>;

export type LeadDraft = {
  service: ServiceId | null;
  photoUrl: string | null;
  photoUploaded: boolean;
  /**
   * Estado interno del quiz con la nueva shape multi-select + Otro. Antes
   * era `Record<string, string>`; ahora cada campo guarda `{ values, otherText }`.
   * En el momento de enviar al webhook se aplana con `flattenQuizState`.
   */
  quizAnswers: QuizState;
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

/**
 * Aplana el estado interno del quiz a un Record<string, string> apto para
 * el payload de GHL. Multi-select se une con " | ". El "Otro" se prefija
 * con "Otro: <texto>" cuando el usuario lo respondió.
 */
export function flattenQuizState(state: QuizState): QuizAnswers {
  const out: QuizAnswers = {};
  for (const [key, field] of Object.entries(state)) {
    const parts = field.values.map((v) => {
      if (v === "Otro") {
        const txt = field.otherText.trim();
        return txt ? `Otro: ${txt}` : "Otro";
      }
      return v;
    });
    if (parts.length > 0) out[key] = parts.join(" | ");
  }
  return out;
}

/**
 * Extrae todas las respuestas como array plano de strings, ideal para
 * pasarle a `mapToFeeling()`. Incluye el texto libre de "Otro".
 */
export function quizStateToTextArray(state: QuizState): string[] {
  const out: string[] = [];
  for (const field of Object.values(state)) {
    for (const v of field.values) {
      if (v !== "Otro") out.push(v);
    }
    if (field.otherText.trim()) out.push(field.otherText.trim());
  }
  return out;
}
