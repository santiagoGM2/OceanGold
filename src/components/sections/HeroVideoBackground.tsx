"use client";

/**
 * Backdrop de video del Hero.
 *
 * SSR: sólo se emite `<video>` con poster (cero bytes de video en el HTML).
 * Las fuentes (webm/mp4) se adjuntan vía JS, dependiendo del contexto:
 *
 *   - Desktop (≥1024px): adjuntar inmediatamente. `pause()` y `useScroll`
 *     mapea `currentTime` al scrollYProgress del section Hero (scrubbing).
 *
 *   - Mobile (<1024px): **nunca** se adjuntan sources. Queda sólo el poster
 *     `.webp` (~105 KB). Decisión Fase F.5: el video en mobile pesaba el LCP
 *     a ~5.7s sin aportar wow factor real en pantalla pequeña con overlay
 *     al 50-75%. Mover a poster-only sube Lighthouse mobile de 63 a 75+ sin
 *     pérdida visual significativa.
 *
 *   - `prefers-reduced-motion`: no adjuntar sources, queda el poster estático.
 */

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";

interface Props {
  heroRef: RefObject<HTMLElement | null>;
}

function attachSources(v: HTMLVideoElement) {
  if (v.querySelectorAll("source").length > 0) return;
  const webm = document.createElement("source");
  webm.src = "/videos/ocean.webm";
  webm.type = "video/webm";
  const mp4 = document.createElement("source");
  mp4.src = "/videos/ocean.mp4";
  mp4.type = "video/mp4";
  v.appendChild(webm);
  v.appendChild(mp4);
  v.load();
}

export function HeroVideoBackground({ heroRef }: Props) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isDesktopRef = useRef(false);

  useEffect(() => {
    isDesktopRef.current = window.matchMedia("(min-width: 1024px)").matches;
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const v = videoRef.current;
    if (!v || !v.duration || Number.isNaN(v.duration)) return;
    if (reduce) return;
    if (!isDesktopRef.current) return;
    v.currentTime = Math.min(progress * v.duration, v.duration - 0.05);
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduce) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      // Mobile: queda poster-only. Decisión Fase F.5 — el LCP en mobile vale
      // más que el video sutil de fondo (pantalla pequeña + overlay al 50%+).
      return;
    }

    // Desktop: adjuntar sources para que el scrubbing tenga el video listo.
    attachSources(v);
    v.pause();
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
        preload="none"
        poster="/images/hero-poster.webp"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(6.5% 0.018 158 / 0.5) 0%, oklch(6.5% 0.018 158 / 0.75) 100%)",
        }}
      />
    </div>
  );
}
