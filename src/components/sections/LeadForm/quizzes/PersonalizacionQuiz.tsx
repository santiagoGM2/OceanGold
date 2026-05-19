"use client";

import { QuizRenderer, type QuizFieldConfig } from "./QuizRenderer";

// La pregunta sobre referencia/imagen fue eliminada — ya se sube foto en Step 2.
const FIELDS: readonly QuizFieldConfig[] = [
  {
    key: "story_to_become_jewel",
    question: "¿Qué historia te gustaría convertir en una joya?",
    multiSelect: false,
    hasOther: true,
    required: true,
    options: [
      "Un recuerdo importante",
      "Un regalo especial",
      "Algo que represente mi estilo",
      "Una pieza única que nadie más tenga",
      "Un símbolo de mi relación/familia",
      "Una joya para una ocasión especial",
      "Quiero transformar una idea en algo real",
      "Aún no estoy seguro/a, quiero asesoría",
    ],
  },
];

export function PersonalizacionQuiz() {
  return <QuizRenderer fields={FIELDS} />;
}
