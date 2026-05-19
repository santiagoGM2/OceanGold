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
 *   - Mobile (<1024px) en red rápida: diferir el attach + play() hasta
 *     `requestIdleCallback` (fallback `setTimeout` 1500ms). Esto saca el
 *     download del video del critical path para que el LCP del h1 gane.
 *
 *   - Mobile + `saveData` / `effectiveType` ∈ {slow-2g, 2g, 3g}: no adjuntar
 *     sources nunca. Queda sólo el poster `.webp` (~105 KB) como backdrop.
 *
 *   - `prefers-reduced-motion`: no adjuntar sources, queda el poster estático.
 *
 * Por qué no usar `preload="metadata"` + autoplay: en mobile la llamada a
 * `play()` dispara la descarga completa (~3.5 MB), bloqueando el LCP a 5s+
 * en Slow 4G simulado.
 */

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";

interface Props {
  heroRef: RefObject<HTMLElement | null>;
}

type ConnectionInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

function isSlowConnection(): boolean {
  const conn = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  if (!conn) return false;
  if (conn.saveData === true) return true;
  if (conn.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
    return true;
  }
  return false;
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

    if (isDesktop) {
      // Desktop: video disponible para scrubbing desde el inicio (sin play).
      attachSources(v);
      v.pause();
      return;
    }

    // Mobile.
    if (isSlowConnection()) return;

    // Diferir attach + play hasta que el browser esté idle, fuera del
    // critical path. El poster cubre el Hero mientras tanto.
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const kick = () => {
      const vid = videoRef.current;
      if (!vid) return;
      attachSources(vid);
      const p = vid.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      idleHandle = win.requestIdleCallback(kick, { timeout: 3000 });
    } else {
      timeoutHandle = setTimeout(kick, 1500);
    }

    return () => {
      if (idleHandle != null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };
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
