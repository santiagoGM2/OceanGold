"use client";

import { QuizRenderer, type QuizFieldConfig } from "./QuizRenderer";

const FIELDS: readonly QuizFieldConfig[] = [
  {
    key: "represents",
    question: "¿Qué te gustaría que esta pieza representara para ti?",
    multiSelect: false,
    hasOther: true,
    required: true,
    options: [
      "Mi estilo personal",
      "Un logro importante",
      "Elegancia y presencia",
      "Un recuerdo especial",
      "Algo exclusivo y único",
      "Un regalo significativo",
      "Mi evolución personal",
    ],
  },
  {
    key: "idea_clarity",
    question: "¿Qué tan clara tienes la idea de la pieza que quieres crear?",
    multiSelect: false,
    hasOther: false,
    required: true,
    options: [
      "Ya la tengo completamente definida",
      "Tengo referencias o inspiración",
      "Tengo una idea general",
      "Quiero ayuda para diseñarla",
      "Quiero explorar opciones",
      "No estoy seguro/a todavía",
    ],
  },
  {
    key: "how_to_feel",
    question:
      "Si esta joya ya estuviera terminada, ¿cómo te gustaría sentirte al usarla?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Más seguro/a de mí",
      "Elegante y diferente",
      "Orgulloso/a de tener algo único",
      "Emocionado/a por usarla",
      "Identificado/a con mi estilo",
      "Como si fuera una pieza hecha para mí",
    ],
  },
  {
    key: "real_goal",
    question: "¿Qué buscas realmente al crear esta pieza?",
    multiSelect: true,
    hasOther: true,
    required: true,
    options: [
      "Tener algo único",
      "Representar una historia importante",
      "Expresar mi personalidad",
      "Crear un regalo especial",
      "Diseñar algo que dure años",
      "Sentirme diferente al usarla",
      "Convertir una idea en algo real",
    ],
  },
];

export function ArmadoQuiz() {
  return <QuizRenderer fields={FIELDS} />;
}
