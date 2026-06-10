"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { COPY } from "@/lib/constants";
import { track } from "@/lib/analytics";

// Tiempo de inactividad antes de pasar al siguiente par en mobile.
// Demasiado corto = se siente que se cambia solo mientras interactúan;
// demasiado largo = el usuario se queda atascado en un par.
const MOBILE_AUTO_ADVANCE_MS = 3500;

const EASE = [0.16, 1, 0.3, 1] as const;

const PAIRS = [
  { id: "01", beforeSrc: "/images/before-after/1.webp", afterSrc: "/images/before-after/2.webp", alt: "Pieza recuperada por el taller DuJoyero — caso 01" },
  { id: "02", beforeSrc: "/images/before-after/3.webp", afterSrc: "/images/before-after/4.webp", alt: "Pieza recuperada por el taller DuJoyero — caso 02" },
  { id: "03", beforeSrc: "/images/before-after/5.webp", afterSrc: "/images/before-after/6.webp", alt: "Pieza recuperada por el taller DuJoyero — caso 03" },
  { id: "04", beforeSrc: "/images/before-after/7.webp", afterSrc: "/images/before-after/8.webp", alt: "Pieza recuperada por el taller DuJoyero — caso 04" },
  { id: "05", beforeSrc: "/images/before-after/9.webp", afterSrc: "/images/before-after/10.webp", alt: "Pieza recuperada por el taller DuJoyero — caso 05" },
];

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return bp;
}

export function BeforeAfter() {
  const reduce = useReducedMotion();
  const bp = useBreakpoint();
  const perPage = bp === "desktop" ? 3 : bp === "tablet" ? 2 : 1;
  const totalPages = bp === "mobile" ? PAIRS.length : Math.ceil(PAIRS.length / perPage);
  const [rawPage, setRawPage] = useState(0);

  // Clampamos en render para no necesitar un effect que sincronice page con totalPages.
  const page = Math.min(rawPage, totalPages - 1);
  const setPage = (next: number | ((p: number) => number)) =>
    setRawPage((p) => {
      const candidate = typeof next === "function" ? next(p) : next;
      return Math.max(0, Math.min(totalPages - 1, candidate));
    });

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Sync del scroll horizontal con el page state (sólo desktop/tablet).
  useEffect(() => {
    if (bp === "mobile" || !scrollerRef.current) return;
    const el = scrollerRef.current;
    el.scrollTo({
      left: page * el.clientWidth,
      behavior: reduce ? "instant" : "smooth",
    });
  }, [page, bp, reduce]);

  // Mobile: auto-avance entre pares cuando el usuario lleva un rato sin
  // interactuar con el slider activo. Cada interacción reinicia el timer.
  // En reduced-motion, NO auto-avanza — sólo manual con los dots.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);
  const scheduleAdvance = useCallback(() => {
    clearAdvanceTimer();
    if (reduce) return;
    advanceTimerRef.current = setTimeout(() => {
      setRawPage((p) => (p + 1) % PAIRS.length);
    }, MOBILE_AUTO_ADVANCE_MS);
  }, [clearAdvanceTimer, reduce]);

  useEffect(() => {
    if (bp !== "mobile" || !inView) {
      clearAdvanceTimer();
      return;
    }
    scheduleAdvance();
    return clearAdvanceTimer;
  }, [bp, inView, page, scheduleAdvance, clearAdvanceTimer]);

  const handleInteract = useCallback(() => {
    if (bp !== "mobile") return;
    // El usuario está moviendo el slider — reiniciar el timer de auto-avance.
    scheduleAdvance();
  }, [bp, scheduleAdvance]);

  const visiblePairs = PAIRS;

  const headerIn = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.7, ease: EASE },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: reduce ? 0 : 0.15 },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="antes-despues"
      className="relative px-6 md:px-14 py-20 md:py-32 border-t border-border-subtle"
    >
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="max-w-7xl mx-auto"
      >
        <motion.span
          variants={headerIn}
          className="block text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-5 font-light"
        >
          {COPY.beforeAfter.eyebrow}
        </motion.span>
        <motion.h2
          variants={headerIn}
          className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-ivory font-light leading-[1.08] tracking-[0.02em] mb-3 max-w-3xl"
        >
          {COPY.beforeAfter.title}
        </motion.h2>
        <motion.p
          variants={headerIn}
          className="text-text-muted font-light max-w-2xl mb-12"
        >
          Cada pieza tiene un capítulo guardado. Mueve el divisor dorado para
          ver cómo abrimos el siguiente.
        </motion.p>

        {/* Carousel container */}
        <motion.div variants={headerIn} className="group relative">
          {bp === "mobile" ? (
            // Móvil: UN par a la vez. Crossfade entre pares (3.5s tras última
            // interacción). El usuario interactúa con el slider activo,
            // dejar de interactuar dispara el avance al siguiente par.
            // Sin snap-scroll horizontal → el drag del divisor dorado no
            // compite con el gesture del scroll y se siente fluido.
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={visiblePairs[page]?.id ?? "ba-pair"}
                  initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                >
                  <BeforeAfterSlider
                    beforeSrc={visiblePairs[page].beforeSrc}
                    afterSrc={visiblePairs[page].afterSrc}
                    alt={visiblePairs[page].alt}
                    playWelcomeAnimation={page === 0}
                    aspect="5/6"
                    priority={false}
                    onInteract={handleInteract}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            // Desktop/Tablet: paginación con flechas
            <>
              <div
                ref={scrollerRef}
                className="overflow-hidden"
              >
                <div className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {Array.from({ length: totalPages }).map((_, pageIdx) => (
                    <div
                      key={pageIdx}
                      className={
                        "flex-shrink-0 w-full grid gap-6 " +
                        (perPage === 3 ? "grid-cols-3" : "grid-cols-2")
                      }
                      style={{
                        transform: `translateX(${-page * 100}%)`,
                      }}
                    >
                      {visiblePairs
                        .slice(pageIdx * perPage, pageIdx * perPage + perPage)
                        .map((p, idx) => (
                          <BeforeAfterSlider
                            key={p.id}
                            beforeSrc={p.beforeSrc}
                            afterSrc={p.afterSrc}
                            alt={p.alt}
                            playWelcomeAnimation={pageIdx === 0 && idx === 0}
                            aspect="5/6"
                            priority={false}
                          />
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flechas */}
              {totalPages > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Página anterior"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="absolute top-1/2 -translate-y-1/2 -left-3 lg:-left-5 w-11 h-11 rounded-full bg-surface-0/80 backdrop-blur-md border border-accent-gold/50 text-accent-gold opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-gold hover:text-surface-0"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    aria-label="Página siguiente"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page === totalPages - 1}
                    className="absolute top-1/2 -translate-y-1/2 -right-3 lg:-right-5 w-11 h-11 rounded-full bg-surface-0/80 backdrop-blur-md border border-accent-gold/50 text-accent-gold opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-gold hover:text-surface-0"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={2} />
                  </button>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Dots de paginación + CTA */}
        <motion.div
          variants={headerIn}
          className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
        >
          {totalPages > 1 ? (
            <div
              className="flex items-center justify-center md:justify-start gap-2.5"
              role="tablist"
              aria-label={bp === "mobile" ? "Pares antes y después" : "Páginas de comparaciones"}
            >
              {Array.from({ length: totalPages }).map((_, i) => {
                const active = i === page;
                // Mobile: dots redondos premium (uno por par). Desktop/tablet:
                // barras horizontales con la activa más larga.
                const isMobile = bp === "mobile";
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={
                      isMobile
                        ? `Ver par ${i + 1} de ${totalPages}`
                        : `Página ${i + 1} de ${totalPages}`
                    }
                    onClick={() => {
                      setPage(i);
                      if (isMobile) handleInteract();
                    }}
                    className={
                      isMobile
                        ? "h-2.5 rounded-full transition-all duration-300 cursor-pointer " +
                          (active
                            ? "w-7 bg-accent-gold shadow-[0_0_10px_oklch(65%_0.096_72/0.5)]"
                            : "w-2.5 bg-border-subtle hover:bg-accent-gold/50")
                        : "h-[2px] transition-all duration-500 cursor-pointer " +
                          (active
                            ? "w-12 bg-accent-gold"
                            : "w-6 bg-border-subtle hover:bg-accent-gold/50")
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div />
          )}

          <a
            href="#diagnostico"
            data-cta-section="before_after"
            data-cta-label="mi_joya"
            onClick={() => track("cta_clicked", { section: "before_after", label: "mi_joya" })}
            className="cta-pulse gold-cta inline-flex items-center gap-4 self-start md:self-auto px-10 py-4 border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.beforeAfter.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
