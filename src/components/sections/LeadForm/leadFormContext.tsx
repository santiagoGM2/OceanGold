"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Feeling, ServiceId } from "@/lib/constants";
import {
  flattenQuizState,
  quizStateToTextArray,
  type LeadDraft,
  type QuizAnswers,
  type QuizFieldState,
} from "@/types/lead";
import { mapToFeeling } from "@/lib/feelingMapper";

const STORAGE_KEY = "oceangold:lead-draft:v1";

export const STEPS = [
  "service",
  "photo",
  "aha",
  "quiz",
  "contact",
  "calendar",
] as const;
export type StepId = (typeof STEPS)[number];

const INITIAL_DRAFT: LeadDraft = {
  service: null,
  photoUrl: null,
  photoUploaded: false,
  quizAnswers: {},
  feeling: null,
  name: "",
  phone: "",
  email: "",
};

type State = {
  step: StepId;
  draft: LeadDraft;
  submitted: boolean;
  submitting: boolean;
  bookingDay: string | null;
  bookingTime: string | null;
};

type Action =
  | { type: "select_service"; service: ServiceId }
  | { type: "set_photo"; photoUrl: string }
  | { type: "clear_photo" }
  | { type: "set_quiz_field"; key: string; field: QuizFieldState }
  | { type: "set_feeling"; feeling: Feeling }
  | { type: "set_contact"; name: string; phone: string; email: string }
  | { type: "go"; step: StepId }
  | { type: "submit_start" }
  | { type: "submit_done" }
  | { type: "submit_fail" }
  | { type: "set_booking"; day: string; time: string }
  | { type: "reset" }
  | { type: "hydrate"; state: State };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select_service":
      return {
        ...state,
        draft: { ...state.draft, service: action.service },
        // Si el usuario eligió desde Situations, saltamos Step1.
        step: state.step === "service" ? "photo" : state.step,
      };
    case "set_photo":
      return {
        ...state,
        draft: { ...state.draft, photoUrl: action.photoUrl, photoUploaded: true },
      };
    case "clear_photo":
      return {
        ...state,
        draft: { ...state.draft, photoUrl: null, photoUploaded: false },
      };
    case "set_quiz_field":
      return {
        ...state,
        draft: {
          ...state.draft,
          quizAnswers: { ...state.draft.quizAnswers, [action.key]: action.field },
        },
      };
    case "set_feeling":
      return {
        ...state,
        draft: { ...state.draft, feeling: action.feeling },
      };
    case "set_contact":
      return {
        ...state,
        draft: {
          ...state.draft,
          name: action.name,
          phone: action.phone,
          email: action.email,
        },
      };
    case "go":
      return { ...state, step: action.step };
    case "submit_start":
      return { ...state, submitting: true };
    case "submit_done":
      return { ...state, submitting: false, submitted: true };
    case "submit_fail":
      return { ...state, submitting: false };
    case "set_booking":
      return { ...state, bookingDay: action.day, bookingTime: action.time };
    case "reset":
      return INITIAL_STATE;
    case "hydrate":
      return action.state;
    default:
      return state;
  }
}

const INITIAL_STATE: State = {
  step: "service",
  draft: INITIAL_DRAFT,
  submitted: false,
  submitting: false,
  bookingDay: null,
  bookingTime: null,
};

type LeadFormContextValue = {
  state: State;
  selectService: (service: ServiceId) => void;
  setPhoto: (photoUrl: string) => void;
  clearPhoto: () => void;
  setQuizField: (key: string, field: QuizFieldState) => void;
  setFeeling: (feeling: Feeling) => void;
  /**
   * Recalcula el feeling con `mapToFeeling` usando todas las respuestas
   * del quiz + textos libres "Otro" actuales. Llamarlo justo antes de
   * avanzar al Step4 / submit.
   */
  computeFeelingFromQuiz: () => Feeling;
  setContact: (name: string, phone: string, email: string) => void;
  go: (step: StepId) => void;
  submitStart: () => void;
  submitDone: () => void;
  submitFail: () => void;
  setBooking: (day: string, time: string) => void;
  reset: () => void;
  // Compat con LeadFormProvider previo: selectService haciendo scroll al form.
  selectServiceAndScroll: (service: ServiceId) => void;
  // Helper para construir payload para el webhook. Aplana el QuizState
  // interno a Record<string, string> via `flattenQuizState`.
  buildPayload: () => {
    name: string;
    phone: string;
    email: string;
    service: ServiceId | null;
    photoUrl: string | null;
    quizAnswers: QuizAnswers;
    feeling: Feeling | null;
  };
};

const LeadFormCtx = createContext<LeadFormContextValue | null>(null);

export function LeadFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Hidratar desde sessionStorage en mount. Sólo si el usuario no ha terminado.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as State;
      if (parsed && typeof parsed === "object" && parsed.draft) {
        // No restauramos `submitted`/`submitting` para evitar estados pegados.
        dispatch({
          type: "hydrate",
          state: { ...parsed, submitting: false },
        });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist en sessionStorage cada vez que el estado cambia.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const selectService = useCallback((service: ServiceId) => {
    dispatch({ type: "select_service", service });
  }, []);

  const selectServiceAndScroll = useCallback((service: ServiceId) => {
    dispatch({ type: "select_service", service });
    if (typeof window !== "undefined") {
      const el = document.getElementById("diagnostico");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const setPhoto = useCallback((photoUrl: string) => {
    dispatch({ type: "set_photo", photoUrl });
  }, []);

  const clearPhoto = useCallback(() => {
    dispatch({ type: "clear_photo" });
  }, []);

  const setQuizField = useCallback((key: string, field: QuizFieldState) => {
    dispatch({ type: "set_quiz_field", key, field });
  }, []);

  const setFeeling = useCallback((feeling: Feeling) => {
    dispatch({ type: "set_feeling", feeling });
  }, []);

  // `state` capturado en cierre del callback; usamos ref para leer fresco.
  const computeFeelingFromQuiz = useCallback((): Feeling => {
    const answers = quizStateToTextArray(state.draft.quizAnswers);
    const feeling = mapToFeeling(answers);
    dispatch({ type: "set_feeling", feeling });
    return feeling;
  }, [state.draft.quizAnswers]);

  const setContact = useCallback((name: string, phone: string, email: string) => {
    dispatch({ type: "set_contact", name, phone, email });
  }, []);

  const go = useCallback((step: StepId) => dispatch({ type: "go", step }), []);
  const submitStart = useCallback(() => dispatch({ type: "submit_start" }), []);
  const submitDone = useCallback(() => dispatch({ type: "submit_done" }), []);
  const submitFail = useCallback(() => dispatch({ type: "submit_fail" }), []);
  const setBooking = useCallback(
    (day: string, time: string) => dispatch({ type: "set_booking", day, time }),
    []
  );
  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  const buildPayload = useCallback(() => {
    const d = state.draft;
    return {
      name: d.name,
      phone: d.phone,
      email: d.email,
      service: d.service,
      photoUrl: d.photoUrl,
      quizAnswers: flattenQuizState(d.quizAnswers),
      feeling: d.feeling,
    };
  }, [state.draft]);

  const value = useMemo<LeadFormContextValue>(
    () => ({
      state,
      selectService,
      selectServiceAndScroll,
      setPhoto,
      clearPhoto,
      setQuizField,
      setFeeling,
      computeFeelingFromQuiz,
      setContact,
      go,
      submitStart,
      submitDone,
      submitFail,
      setBooking,
      reset,
      buildPayload,
    }),
    [
      state,
      selectService,
      selectServiceAndScroll,
      setPhoto,
      clearPhoto,
      setQuizField,
      setFeeling,
      computeFeelingFromQuiz,
      setContact,
      go,
      submitStart,
      submitDone,
      submitFail,
      setBooking,
      reset,
      buildPayload,
    ]
  );

  return <LeadFormCtx.Provider value={value}>{children}</LeadFormCtx.Provider>;
}

export function useLeadForm(): LeadFormContextValue {
  const ctx = useContext(LeadFormCtx);
  if (!ctx) {
    throw new Error("useLeadForm debe usarse dentro de <LeadFormProvider>");
  }
  return ctx;
}
