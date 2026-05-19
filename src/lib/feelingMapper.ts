/**
 * Mapeo determinístico de respuestas libres del quiz al sentimiento
 * Amor / Orgullo / Seguridad / Estatus.
 *
 * Reglas:
 *   1. Cuenta apariciones de keywords case-insensitive en el texto
 *      concatenado de todas las respuestas.
 *   2. Si todos los conteos son 0, devuelve "Amor" (default conservador,
 *      coherente con el copy del cliente).
 *   3. En caso de empate, prioridad: Amor > Estatus > Orgullo > Seguridad.
 *
 * El sentimiento se calcula al momento de enviar el formulario y viaja
 * al webhook GHL como antes — el contrato del payload no cambia.
 */

// Re-declarado localmente (en vez de importar de "./constants") para que el
// módulo sea autocontenido y los tests con `node --experimental-strip-types`
// no requieran extensión `.ts` en cada import del grafo.
export const FEELINGS = ["Amor", "Orgullo", "Seguridad", "Estatus"] as const;
export type Feeling = (typeof FEELINGS)[number];

export const FEELING_KEYWORDS: Record<Feeling, readonly string[]> = {
  Amor: [
    "recuerdo",
    "sentimental",
    "familia",
    "pareja",
    "relación",
    "significativo",
    "identificado",
    "parte de mi vida",
    "historia",
    "regalo especial",
    "representar",
    "valor sentimental",
  ],
  Orgullo: [
    "logro",
    "presencia",
    "elegancia",
    "elegante",
    "diferente",
    "orgulloso",
    "evolución",
    "transformarla",
    "mejor",
  ],
  Seguridad: [
    "confianza",
    "tranquilidad",
    // "conserv" (en vez de "conservar") para que también matchee
    // "conservándola", "conservarla", etc.
    "conserv",
    "cuidado",
    "mantener",
    "proteger",
    "asegurarme",
    "evaluación",
    "profesional",
    "vale la pena",
    "deteriorándose",
    "arreglo",
  ],
  Estatus: [
    "estilo",
    "personal",
    // "únic" en vez de "único" para que matchee "única", "únicos", "únicas".
    "únic",
    "exclusivo",
    "expresar",
    "personalidad",
    "hecha para mí",
    "todo el tiempo",
    "eventos",
  ],
} as const;

/** Orden de desempate ante conteos iguales. */
const TIE_PRIORITY: readonly Feeling[] = ["Amor", "Estatus", "Orgullo", "Seguridad"];

export function mapToFeeling(answers: readonly string[]): Feeling {
  const counts: Record<Feeling, number> = {
    Amor: 0,
    Orgullo: 0,
    Seguridad: 0,
    Estatus: 0,
  };
  const text = answers.join(" ").toLowerCase();

  for (const feeling of FEELINGS) {
    for (const kw of FEELING_KEYWORDS[feeling]) {
      if (text.includes(kw.toLowerCase())) {
        counts[feeling]++;
      }
    }
  }

  const max = Math.max(...Object.values(counts));
  if (max === 0) return "Amor";
  return TIE_PRIORITY.find((f) => counts[f] === max) ?? "Amor";
}
