"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { COPY } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as [number, number, number, number];

export function Alert() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Parallax sutil: la imagen de fondo se mueve un poco más lento que el
  // contenido, creando profundidad sin distraer. Se desactiva con reduce.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.06, 1.12]);

  // Copy localStat: "En Miami, más del 60% de las joyas familiares se
  // pierden por daños que se pudieron reparar a tiempo."
  // Partimos para destacar el "60%" con scale-pop + glow.
  const localStat = COPY.alert.localStat;
  const parts = localStat.split(/(60\s?%)/i);

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
      transition: {
        staggerChildren: reduce ? 0 : 0.15,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  };

  const numberPop = {
    hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.55 },
    visible: {
      opacity: 1,
      scale: reduce ? 1 : [0.55, 1.18, 1],
      transition: {
        duration: reduce ? 0 : 1.1,
        ease: EASE_OUT,
        delay: reduce ? 0 : 0.55,
        times: reduce ? undefined : [0, 0.62, 1],
      },
    },
  };

  // Glow pulse continuo MUY sutil sobre el 60% para mantener atención.
  const numberGlow = reduce
    ? {}
    : {
        textShadow: [
          "0 0 28px oklch(65% 0.096 72 / 0.3)",
          "0 0 42px oklch(65% 0.096 72 / 0.55)",
          "0 0 28px oklch(65% 0.096 72 / 0.3)",
        ],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: 1.6,
        },
      };

  return (
    <section
      ref={sectionRef}
      id="alerta"
      className="relative px-6 md:px-14 py-24 md:py-40 border-y border-border-subtle overflow-hidden isolate"
    >
      {/* Capa 1: imagen de fondo (responsive — cel.webp en mobile, pc.webp
          en desktop) con parallax + scale ligero. Las imágenes traen su
          propio fundido dramático que combina con el malachite. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ y: bgY, scale: bgScale }}
      >
        {/* Mobile background — portrait 3:4 */}
        <Image
          src="/images/alert-bg-mobile.webp"
          alt=""
          fill
          priority={false}
          sizes="(min-width: 768px) 0px, 100vw"
          className="object-cover object-center md:hidden"
        />
        {/* Desktop background — landscape 3:2 */}
        <Image
          src="/images/alert-bg-desktop.webp"
          alt=""
          fill
          priority={false}
          sizes="(min-width: 768px) 100vw, 0px"
          className="object-cover object-center hidden md:block"
        />
      </motion.div>

      {/* Capa 2: gradient overlay malachite — más oscuro arriba/abajo
          para que el texto domine, ligeramente más claro al centro para
          dejar respirar la imagen. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, oklch(6.5% 0.018 158 / 0.92) 0%, oklch(6.5% 0.018 158 / 0.72) 35%, oklch(6.5% 0.018 158 / 0.7) 65%, oklch(6.5% 0.018 158 / 0.92) 100%)",
        }}
      />

      {/* Capa 3: vignette radial sutil, foco al centro-izquierda */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 32% 50%, transparent 0%, oklch(4% 0.015 158 / 0.45) 100%)",
        }}
      />

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="relative max-w-7xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-3 text-[0.68rem] tracking-[0.4em] uppercase text-accent-gold mb-7 font-medium"
        >
          <span aria-hidden className="block w-7 h-px bg-accent-gold" />
          {COPY.alert.eyebrow}
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-[clamp(1.95rem,3.8vw,3.4rem)] text-ivory font-light leading-[1.12] tracking-[-0.005em] mb-8 max-w-4xl drop-shadow-[0_2px_24px_oklch(0%_0_0/0.5)]"
        >
          {COPY.alert.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-[clamp(1rem,1.4vw,1.18rem)] text-text-default font-light leading-[1.85] max-w-3xl mb-12"
        >
          {COPY.alert.body}
        </motion.p>

        {/* Stat local con el 60% destacado — scale-pop + glow continuo */}
        <motion.p
          variants={fadeUp}
          className="font-serif text-[clamp(1.3rem,2.5vw,2.3rem)] text-ivory font-light leading-[1.35] tracking-[0.005em] max-w-4xl mb-14"
        >
          {parts.map((chunk, i) => {
            if (/60\s?%/.test(chunk)) {
              return (
                <motion.span
                  key={i}
                  variants={numberPop}
                  animate={inView ? numberGlow : undefined}
                  className="inline-block text-accent-gold font-normal mx-1.5"
                  style={{ originY: 0.6 }}
                >
                  {chunk}
                </motion.span>
              );
            }
            return <span key={i}>{chunk}</span>;
          })}
        </motion.p>

        <motion.div variants={fadeUp}>
          <a
            href="#diagnostico"
            data-cta-section="alert"
            data-cta-label={COPY.alert.cta}
            className="gold-cta inline-flex items-center gap-4 px-10 py-4 rounded-md border border-accent-gold text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.alert.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
