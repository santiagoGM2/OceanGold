"use client";

/**
 * Backdrop del Hero — versión Fundido optimizada para performance.
 *
 * Best practices aplicadas:
 * 1. `<source media>` queries: en mobile (<768px) sirve fundido-mobile.mp4
 *    (1.5MB, 540×960) en lugar de fundido.mp4 (3.2MB, 720p). El navegador
 *    elige al inicio cuál descargar → ahorro real de datos.
 * 2. IntersectionObserver via useInView: cuando el Hero sale del viewport,
 *    el video se PAUSA. Cuando vuelve a entrar, RESUME. Elimina el ~50%
 *    de carga GPU sostenida que se daba antes (decoding frames en background).
 * 3. preload="none": no descarga bytes hasta que attachSources se llama
 *    en el useEffect post-mount. El poster `.webp` (134KB) cubre el
 *    critical path del primer paint.
 * 4. reduced-motion: queda el poster estático, sin attachSources.
 *
 * Overlays para legibilidad: gradient malachite + vignette radial + noise.
 */

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

const POSTER = "/images/hero-fundido-poster.webp";

function attachSources(v: HTMLVideoElement) {
  if (v.querySelectorAll("source").length > 0) return;
  // Mobile-first: webm/mp4 540p para mobile; webm/mp4 720p para desktop.
  // El browser elige basado en `media` query al parsear <source>.
  const sources: Array<{ src: string; type: string; media?: string }> = [
    { src: "/videos/fundido-mobile.webm", type: "video/webm", media: "(max-width: 768px)" },
    { src: "/videos/fundido-mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
    { src: "/videos/fundido.webm", type: "video/webm" },
    { src: "/videos/fundido.mp4", type: "video/mp4" },
  ];
  for (const s of sources) {
    const el = document.createElement("source");
    el.src = s.src;
    el.type = s.type;
    if (s.media) el.setAttribute("media", s.media);
    v.appendChild(el);
  }
  v.load();
}

export function HeroVideoBackground() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // amount: 0 → empieza a pausar/reanudar tan pronto el Hero sale por
  // completo del viewport. once: false → tracking continuo.
  const inView = useInView(containerRef, { amount: 0, once: false });
  // Track si ya attachamos las sources (one-shot) para no re-mutar el DOM.
  const sourcesAttached = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const v = videoRef.current;
    if (!v) return;

    if (inView) {
      if (!sourcesAttached.current) {
        attachSources(v);
        sourcesAttached.current = true;
      }
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else if (sourcesAttached.current) {
      // Sólo pausamos si ya estamos reproduciendo — antes de la primera
      // entrada al viewport no hay nada que pausar.
      v.pause();
    }
  }, [inView, reduce]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="none"
        poster={POSTER}
      />
      {/* Capa 1: overlay dark malachite con gradient vertical fuerte */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(6.5% 0.018 158 / 0.85) 0%, oklch(6.5% 0.018 158 / 0.62) 38%, oklch(6.5% 0.018 158 / 0.6) 60%, oklch(6.5% 0.018 158 / 0.78) 100%)",
        }}
      />
      {/* Capa 2: vignette radial interior */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 50%, transparent 0%, oklch(4% 0.015 158 / 0.35) 100%)",
        }}
      />
      {/* Capa 3: noise sutil — rompe la planitud del overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 1px, oklch(94% 0.01 85 / 0.6) 1px 2px)",
        }}
      />
    </div>
  );
}
