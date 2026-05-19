"use client";

import { QuizRenderer, type QuizFieldConfig } from "./QuizRenderer";

// Mismas preguntas que Reparación (decisión psicológica del cliente).
const FIELDS: readonly QuizFieldConfig[] = [
  {
    key: "feel_when_using",
    question: "¿Qué te gustaría volver a sentir cuando uses esa joya?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Sentir que vuelve a ser parte de mi vida",
      "Recuperar un recuerdo importante",
      "Volver a usarla con confianza",
      "Sentirme bien al usarla otra vez",
      "Recuperar algo con valor sentimental",
      "Volver a sentirme identificado/a con ella",
      "Darle una nueva oportunidad",
      "Quiero transformarla en algo mejor",
    ],
  },
];

export function TransformacionQuiz() {
  return <QuizRenderer fields={FIELDS} />;
}
