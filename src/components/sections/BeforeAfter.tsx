"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import { COPY } from "@/lib/constants";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

const PAIRS = [
  { id: "01", beforeSrc: "/images/before-after/1.webp", afterSrc: "/images/before-after/2.webp", alt: "Pieza recuperada por el taller Ocean Gold — caso 01" },
  { id: "02", beforeSrc: "/images/before-after/3.webp", afterSrc: "/images/before-after/4.webp", alt: "Pieza recuperada por el taller Ocean Gold — caso 02" },
  { id: "03", beforeSrc: "/images/before-after/5.webp", afterSrc: "/images/before-after/6.webp", alt: "Pieza recuperada por el taller Ocean Gold — caso 03" },
  { id: "04", beforeSrc: "/images/before-after/7.webp", afterSrc: "/images/before-after/8.webp", alt: "Pieza recuperada por el taller Ocean Gold — caso 04" },
  { id: "05", beforeSrc: "/images/before-after/9.webp", afterSrc: "/images/before-after/10.webp", alt: "Pieza recuperada por el taller Ocean Gold — caso 05" },
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
  const totalPages = Math.ceil(PAIRS.length / perPage);
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
            // Móvil: swipe nativo con snap-scroll
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6"
              style={{ touchAction: "pan-x pan-y", scrollbarWidth: "thin" }}
            >
              {visiblePairs.map((p, i) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-[88%] snap-start"
                >
                  <BeforeAfterSlider
                    beforeSrc={p.beforeSrc}
                    afterSrc={p.afterSrc}
                    alt={p.alt}
                    playWelcomeAnimation={i === 0}
                    // priority intencionalmente OFF en mobile: las imágenes
                    // viven below-the-fold y el preload de next/image se
                    // estaba comiendo ~10 pts de Lighthouse mobile.
                    priority={false}
                  />
                </div>
              ))}
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
                            priority={pageIdx === 0 && idx === 0}
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
          {bp !== "mobile" && totalPages > 1 ? (
            <div
              className="flex items-center gap-3"
              role="tablist"
              aria-label="Páginas de comparaciones"
            >
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  aria-label={`Página ${i + 1} de ${totalPages}`}
                  onClick={() => setPage(i)}
                  className={
                    "h-[2px] transition-all duration-500 cursor-pointer " +
                    (i === page
                      ? "w-12 bg-accent-gold"
                      : "w-6 bg-border-subtle hover:bg-accent-gold/50")
                  }
                />
              ))}
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
