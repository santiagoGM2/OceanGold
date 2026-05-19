"use client";

import { QuizRenderer, type QuizFieldConfig } from "./QuizRenderer";

const FIELDS: readonly QuizFieldConfig[] = [
  {
    key: "feel_when_using",
    question: "¿Qué te gustaría volver a sentir cuando uses esta joya?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Sentirme elegante otra vez",
      "Volver a usarla con confianza",
      "Que vuelva a verse impecable",
      "Sentir que refleja mi estilo",
      "Recuperar su presencia",
      "Seguir conservándola como nueva",
      "Darle el cuidado que merece",
    ],
  },
  {
    key: "last_maintenance",
    question: "¿Hace cuánto no le haces mantenimiento a esta pieza?",
    multiSelect: false,
    hasOther: false,
    required: true,
    options: [
      "Hace poco",
      "Hace varios meses",
      "Hace más de un año",
      "Nunca le he hecho mantenimiento",
      "No estoy seguro/a",
    ],
  },
  {
    key: "where_to_wear",
    question:
      "Si mañana esta joya volviera a verse como te gusta, ¿dónde te gustaría volver a usarla?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "En mi día a día",
      "En eventos especiales",
      "En reuniones importantes",
      "Con mi familia/pareja",
      "Para sentirme mejor conmigo mismo/a",
      "Volvería a usarla todo el tiempo",
    ],
  },
  {
    key: "what_it_represents",
    question: "¿Qué representa esta joya para ti hoy?",
    multiSelect: false,
    hasOther: true,
    required: true,
    options: [
      "Elegancia",
      "Recuerdos importantes",
      "Mi estilo personal",
      "Seguridad y confianza",
      "Un logro importante",
      "Algo que quiero conservar",
      "Valor sentimental",
    ],
  },
];

export function MantenimientoQuiz() {
  return <QuizRenderer fields={FIELDS} />;
}
