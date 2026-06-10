"use client";

/**
 * Sección "El regalo perfecto" — video del taller como narrativa de regalo/herencia.
 *
 * Layout: dos columnas en desktop (contenido izquierda, video portrait derecha),
 * stacking en mobile.
 *
 * Video behavior:
 *   - Desktop + Mobile: autoplay loop muted playsInline al entrar al viewport.
 *     Sources se adjuntan via JS sólo cuando se entra por primera vez al
 *     viewport (no descarga bytes antes).
 *   - **PAUSA al salir del viewport** (IntersectionObserver via useInView con
 *     once:false). Cuando vuelves a hacer scroll a la sección, RESUME desde
 *     donde quedó. Elimina la carga sostenida de GPU/CPU cuando ya no se ve.
 *   - `prefers-reduced-motion`: poster-only en todo viewport.
 *
 * Aspect ratio del frame del video: 9/16 portrait (matching la fuente
 * 1080×1920 del .mov original del cliente).
 */

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { COPY } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

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

export function GiftVideoSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Dos observers separados para evitar acoplar reveal y pause:
  // - inViewContent (once:true): el stagger se dispara UNA vez y se queda.
  // - inViewVideo (once:false): tracking continuo para pausar/reanudar.
  const inViewContent = useInView(sectionRef, { once: true, amount: 0.25 });
  const inViewVideo = useInView(sectionRef, { once: false, amount: 0.25 });
  const sourcesAttached = useRef(false);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    const v = videoRef.current;
    if (!v) return;
    if (inViewVideo) {
      if (!sourcesAttached.current) {
        attachSources(v);
        sourcesAttached.current = true;
      }
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else if (sourcesAttached.current) {
      // PAUSE al salir del viewport — libera GPU.
      v.pause();
    }
  }, [inViewVideo, reduce]);

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: reduce ? 0 : 0.15 },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="regalo"
      className="relative px-6 md:px-14 py-20 md:py-32 border-t border-border-subtle"
    >
      <motion.div
        initial="hidden"
        // Stagger del contenido se dispara una sola vez (inViewContent
        // tiene once:true) — independiente del pause/play del video.
        animate={inViewContent ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-12 lg:gap-20 items-center">
          {/* Contenido */}
          <div>
            <motion.span
              variants={fadeUp}
              className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light"
            >
              {COPY.gift.eyebrow}
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[-0.015em] mb-6 max-w-2xl"
            >
              {COPY.gift.title}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-text-muted font-light text-[clamp(0.95rem,1.4vw,1.1rem)] leading-[1.85] max-w-xl mb-10"
            >
              {COPY.gift.body}
            </motion.p>

            <motion.div variants={fadeUp}>
              <a
                href="#diagnostico"
                data-cta-section="gift"
                data-cta-label={COPY.gift.cta}
                onClick={() => track("cta_clicked", { section: "gift", label: COPY.gift.cta })}
                className="gold-cta inline-flex items-center gap-4 px-10 py-4 border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0 transition-colors duration-200"
              >
                {COPY.gift.cta}
                <span aria-hidden>→</span>
              </a>
            </motion.div>
          </div>

          {/* Video portrait con marco dorado sutil */}
          <motion.div
            variants={fadeUp}
            className="mx-auto lg:mx-0 w-full max-w-[320px] lg:max-w-none"
          >
            <div className="relative aspect-[9/16] overflow-hidden bg-surface-1 border border-accent-gold/40 shadow-[0_0_40px_oklch(65%_0.096_72/0.15)]">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                loop
                preload="none"
                poster="/images/hero-poster.webp"
                aria-label={COPY.gift.videoAlt}
              />
              {/* Gradient sutil bottom para dar profundidad al frame */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, oklch(6.5% 0.018 158 / 0.5) 100%)",
                }}
              />
              {/* Esquinas doradas decorativas */}
              <span aria-hidden className="absolute top-0 left-0 w-6 h-6 border-l border-t border-accent-gold pointer-events-none" />
              <span aria-hidden className="absolute top-0 right-0 w-6 h-6 border-r border-t border-accent-gold pointer-events-none" />
              <span aria-hidden className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-accent-gold pointer-events-none" />
              <span aria-hidden className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-accent-gold pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
