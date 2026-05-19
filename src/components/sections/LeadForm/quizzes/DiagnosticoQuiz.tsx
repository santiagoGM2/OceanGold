"use client";

import { QuizRenderer, type QuizFieldConfig } from "./QuizRenderer";

const FIELDS: readonly QuizFieldConfig[] = [
  {
    key: "main_concern",
    question: "¿Qué es lo que más te preocupa de esta joya?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Que ya no tenga arreglo",
      "Que siga deteriorándose",
      "Que pierda su valor sentimental",
      "No saber exactamente qué tiene",
      "Que se vea muy desgastada",
      "Tener miedo de dañarla más",
      "No saber si vale la pena repararla",
    ],
  },
  {
    key: "trigger",
    question: "¿Qué te hizo darte cuenta de que esta joya necesita atención?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Se rompió o aflojó algo",
      "Perdió su brillo o apariencia",
      "Dejé de usarla hace tiempo",
      "Empezó a verse desgastada",
      "Tiene una piedra floja/faltante",
      "Quiero asegurarme de que esté bien",
      "Solo quiero una evaluación profesional",
    ],
  },
  {
    key: "what_to_recover",
    question: "¿Qué te gustaría recuperar o conservar de esta pieza?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Su valor sentimental",
      "Su apariencia original",
      "La tranquilidad de volver a usarla",
      "El recuerdo que representa",
      "Su elegancia/presencia",
      "La confianza al usarla",
      "Poder conservarla muchos años más",
    ],
  },
];

export function DiagnosticoQuiz() {
  return <QuizRenderer fields={FIELDS} />;
}
