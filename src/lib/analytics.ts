/**
 * Conversion tracking — Vercel Analytics custom events.
 * Fire-and-forget. Respeta Do-Not-Track. Tipado estricto.
 * Lista completa de eventos en design-system.md sección "Conversion Tracking".
 *
 * Detalle de implementación: el script de Vercel Analytics inyecta `window.va`
 * de forma asíncrona; si `track()` se invoca en un `useEffect` muy temprano
 * (p.ej. `landing_viewed`), el script de Vercel todavía no está listo y la
 * función `track` exportada por `@vercel/analytics` no hace nada (silenciosa
 * por diseño). Por eso reintentamos con backoff hasta que `window.va` exista.
 */
import { track as vercelTrack } from "@vercel/analytics";
import type { Feeling, ServiceId } from "./constants";

type EventMap = {
  landing_viewed: undefined;
  cta_clicked: { section: string; label: string };
  before_after_interacted: undefined;
  situation_selected: { service: ServiceId };
  form_opened: undefined;
  form_step_completed: { step_number: number; step_name: string };
  form_step_abandoned: { step_number: number; time_spent_ms: number };
  aha_reveal_continued: undefined;
  feeling_selected: { feeling: Feeling };
  lead_submitted_to_ghl: { success: boolean; retry_count: number };
  calendar_loaded: undefined;
  booking_completed: { day?: string; time?: string };
  whatsapp_redirect: undefined;
};

type TrackProps = Record<string, string | number | boolean | null>;

function isDoNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const dnt = navigator.doNotTrack;
  return dnt === "1" || dnt === "yes";
}

function isVercelReady(): boolean {
  return typeof window !== "undefined" && typeof window.va === "function";
}

function emit(event: string, props: TrackProps | undefined): void {
  try {
    if (props !== undefined) {
      vercelTrack(event, props);
    } else {
      vercelTrack(event);
    }
  } catch {
    // Fire-and-forget: nunca bloquear UI por analytics.
  }
}

function scheduleEmit(
  event: string,
  props: TrackProps | undefined,
  attempt = 0
): void {
  if (isVercelReady() || attempt >= 20) {
    emit(event, props);
    return;
  }
  // Backoff lineal: ~100ms × 20 intentos = hasta 2s de espera.
  setTimeout(() => scheduleEmit(event, props, attempt + 1), 100);
}

export function track<K extends keyof EventMap>(
  event: K,
  ...args: EventMap[K] extends undefined ? [] : [EventMap[K]]
): void {
  if (isDoNotTrack()) return;
  const props = args[0] as TrackProps | undefined;
  scheduleEmit(event, props);
}
