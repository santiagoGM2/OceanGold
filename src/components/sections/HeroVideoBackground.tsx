"use client";

/**
 * Backdrop del Hero — versión Fundido.
 *
 * Diseño:
 * - Video portrait 1080×1920 (Fundido.mov del cliente) en loop autoplay
 *   en TODO viewport (desktop y mobile).
 * - Overlay dark malachite muy fuerte arriba (85%) y abajo (75%) con
 *   gradient diagonal — garantiza legibilidad total del h1 + subtitle.
 * - Vignette radial interior para enfocar la composición.
 * - SSR emite `<video>` con poster (cero bytes de video en HTML inicial).
 *   Sources se attachan vía JS post-mount → no impacta tiempo de parse.
 * - `prefers-reduced-motion`: queda el poster estático.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const POSTER = "/images/hero-fundido-poster.webp";

function attachSources(v: HTMLVideoElement) {
  if (v.querySelectorAll("source").length > 0) return;
  const webm = document.createElement("source");
  webm.src = "/videos/fundido.webm";
  webm.type = "video/webm";
  const mp4 = document.createElement("source");
  mp4.src = "/videos/fundido.mp4";
  mp4.type = "video/mp4";
  v.appendChild(webm);
  v.appendChild(mp4);
  v.load();
}

export function HeroVideoBackground() {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduce) return;
    const v = videoRef.current;
    if (!v) return;
    attachSources(v);
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
        poster={POSTER}
      />
      {/* Capa 1: overlay dark malachite con gradient vertical fuerte —
          asegura contraste 4.5:1+ para el texto. Top a 85%, mid a 70%,
          bottom a 75%. La parte central ligeramente más clara permite
          que el video "respire" sin competir con la tipografía. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(6.5% 0.018 158 / 0.85) 0%, oklch(6.5% 0.018 158 / 0.62) 38%, oklch(6.5% 0.018 158 / 0.6) 60%, oklch(6.5% 0.018 158 / 0.78) 100%)",
        }}
      />
      {/* Capa 2: vignette radial interior — fuerza la atención hacia el
          centro/izquierda donde vive el h1. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 30% 50%, transparent 0%, oklch(4% 0.015 158 / 0.35) 100%)",
        }}
      />
      {/* Capa 3: noise sutil — rompe la planitud del overlay sin
          comprometer performance (CSS, no imagen). */}
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
