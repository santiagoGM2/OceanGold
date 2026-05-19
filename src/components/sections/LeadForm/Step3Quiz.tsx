"use client";

/**
 * Step3Quiz — dispatcher. Cada servicio tiene su propio quiz con preguntas
 * específicas (decisión psicológica del cliente, ver PDF Fase F.5).
 *
 * Los componentes individuales (ReparacionQuiz, etc.) viven en `./quizzes/`
 * y usan `QuizRenderer` con su config. El feeling Amor/Orgullo/Seguridad/
 * Estatus se calcula automáticamente con `mapToFeeling()` al continuar al
 * Step4 — los chips visibles ya no existen.
 */

import { useLeadForm } from "./leadFormContext";
import { ReparacionQuiz } from "./quizzes/ReparacionQuiz";
import { TransformacionQuiz } from "./quizzes/TransformacionQuiz";
import { PersonalizacionQuiz } from "./quizzes/PersonalizacionQuiz";
import { MantenimientoQuiz } from "./quizzes/MantenimientoQuiz";
import { ArmadoQuiz } from "./quizzes/ArmadoQuiz";
import { DiagnosticoQuiz } from "./quizzes/DiagnosticoQuiz";
import type { ServiceId } from "@/lib/constants";

const QUIZ_BY_SERVICE: Record<ServiceId, () => React.ReactElement> = {
  reparacion: ReparacionQuiz,
  transformacion: TransformacionQuiz,
  personalizacion: PersonalizacionQuiz,
  mantenimiento: MantenimientoQuiz,
  armado: ArmadoQuiz,
  diagnostico: DiagnosticoQuiz,
};

export function Step3Quiz() {
  const { state } = useLeadForm();
  const service = state.draft.service;
  if (!service) {
    // No debería pasar: el step "quiz" sólo es alcanzable con service ya elegido.
    // Renderizamos Diagnóstico como fallback seguro.
    const Fallback = QUIZ_BY_SERVICE.diagnostico;
    return <Fallback />;
  }
  const Quiz = QUIZ_BY_SERVICE[service];
  return <Quiz />;
}
