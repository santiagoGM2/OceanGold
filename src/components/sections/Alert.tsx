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

  // Scroll-driven choreography. La sección se observa desde que entra
  // por abajo hasta que sale por arriba.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // 1. Parallax — la imagen se mueve más lento que el contenido.
  const bgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);

  // 2. Ken Burns base — la imagen siempre está ligeramente sobre-escalada
  //    para que pueda hacer parallax sin mostrar bordes. Combinado con
  //    una animación CSS de zoom lento (ver clase `ken-burns`).
  //    Aquí solo dejamos un valor base.

  // 3. Overlay opacity scroll-driven. Cuando la sección entra al
  //    viewport está más oscuro (foco al header del scroll). Al centro
  //    se aclara — la imagen brilla. Al salir vuelve a oscurecer.
  //    Esto crea sensación de "respiración" cinematográfica.
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [0.55, 0.55, 0.55] : [0.7, 0.42, 0.7]
  );

  // 4. Vignette tightens at center (más enfoque sobre el texto).
  const vignetteOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [0.35, 0.35, 0.35] : [0.25, 0.55, 0.25]
  );

  // Copy localStat: "En Miami, más del 60% de las joyas familiares se
  // pierden por daños que se pudieron reparar a tiempo."
  const localStat = COPY.alert.localStat;
  const parts = localStat.split(/(60\s?%)/i);

  const fadeUp = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.8, ease: EASE },
    },
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.16,
        delayChildren: reduce ? 0 : 0.15,
      },
    },
  };

  const numberPop = {
    hidden: reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: reduce ? 1 : [0.5, 1.22, 1],
      transition: {
        duration: reduce ? 0 : 1.2,
        ease: EASE_OUT,
        delay: reduce ? 0 : 0.65,
        times: reduce ? undefined : [0, 0.6, 1],
      },
    },
  };

  // Glow pulse continuo sobre el 60% — más intenso ahora que la imagen
  // se ve para que el dorado destaque sobre el fondo más claro.
  const numberGlow = reduce
    ? {}
    : {
        textShadow: [
          "0 0 32px oklch(65% 0.096 72 / 0.45)",
          "0 0 56px oklch(65% 0.096 72 / 0.85)",
          "0 0 32px oklch(65% 0.096 72 / 0.45)",
        ],
        transition: {
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: 1.8,
        },
      };

  return (
    <section
      ref={sectionRef}
      id="alerta"
      className="relative px-6 md:px-14 py-24 md:py-40 border-y border-border-subtle overflow-hidden isolate"
    >
      {/* Capa 1: imagen de fondo responsive con parallax + Ken Burns.
          La animación `alert-ken-burns` (CSS) hace zoom muy lento de 1.04
          a 1.12 en 22s, ping-pong. El parallax encima desplaza la posición
          al hacer scroll. Combinados crean una sensación cinematográfica. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none alert-ken-burns"
        style={{ y: bgY }}
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

      {/* Capa 2: overlay scroll-driven. Se aclara en el centro de la
          sección dejando ver más imagen. Diagonal para asimetría. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          opacity: overlayOpacity,
          background:
            "linear-gradient(155deg, oklch(6.5% 0.018 158 / 1) 0%, oklch(6.5% 0.018 158 / 0.5) 35%, oklch(6.5% 0.018 158 / 0.45) 65%, oklch(6.5% 0.018 158 / 1) 100%)",
        }}
      />

      {/* Capa 3: vignette radial scroll-driven — se cierra al centro de
          la sección dando foco al texto, se abre en bordes. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          opacity: vignetteOpacity,
          background:
            "radial-gradient(ellipse 70% 60% at 35% 55%, transparent 0%, oklch(4% 0.015 158 / 1) 100%)",
        }}
      />

      {/* Capa 4: borde gold lateral izquierdo, marca de la sección */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-32 md:h-48 bg-gradient-to-b from-transparent via-accent-gold/70 to-transparent -z-10"
      />

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger}
        className="relative max-w-7xl mx-auto"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-3 text-[0.67rem] tracking-[0.4em] uppercase text-accent-gold mb-7 font-medium drop-shadow-[0_1px_8px_oklch(0%_0_0/0.6)]"
        >
          <span aria-hidden className="block w-7 h-px bg-accent-gold" />
          {COPY.alert.eyebrow}
        </motion.span>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-[clamp(1.95rem,3.8vw,3.4rem)] text-ivory font-light leading-[1.12] tracking-[-0.005em] mb-8 max-w-4xl drop-shadow-[0_2px_22px_oklch(0%_0_0/0.85)]"
        >
          {COPY.alert.title}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-[clamp(1rem,1.4vw,1.18rem)] text-text-default font-light leading-[1.85] max-w-3xl mb-12 drop-shadow-[0_1px_12px_oklch(0%_0_0/0.7)]"
        >
          {COPY.alert.body}
        </motion.p>

        {/* Stat local con el 60% destacado */}
        <motion.p
          variants={fadeUp}
          className="font-serif text-[clamp(1.3rem,2.5vw,2.3rem)] text-ivory font-light leading-[1.35] tracking-[0.005em] max-w-4xl mb-14 drop-shadow-[0_2px_16px_oklch(0%_0_0/0.75)]"
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
            className="gold-cta inline-flex items-center gap-4 px-10 py-4 rounded-md border border-accent-gold bg-surface-0/30 backdrop-blur-[2px] text-accent-gold font-sans text-[0.72rem] tracking-[0.25em] uppercase hover:bg-accent-gold hover:text-surface-0"
          >
            {COPY.alert.cta}
            <span aria-hidden>→</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
