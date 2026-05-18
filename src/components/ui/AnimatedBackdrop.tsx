/**
 * Backdrop multi-capa, 100% CSS + SVG inline (cero JS).
 *
 * Capa 1: mesh gradient con 4 radial-gradients animados (CSS keyframes,
 *         ~30s ciclo). Coloca puntos de oklch malachite + gold-soft que
 *         se desplazan muy lentamente.
 * Capa 2: 50 partículas SVG (15 en mobile via media query) con drift Y
 *         + oscillation X + pulse de opacidad, todas con animation-delay
 *         distinto. Generadas en build time, no en cliente.
 * Capa 3: vignette radial negro → transparente para enfocar el centro.
 *
 * Respeta `prefers-reduced-motion`: deja sólo el gradiente estático + vignette.
 *
 * Performance: el componente es un Server Component (cero JS al cliente).
 * El SVG inline mide ~3 KB minificado; las animaciones CSS se ejecutan en GPU
 * (transform + opacity únicamente).
 */

const PARTICLE_COUNT = 28;
const PARTICLE_COUNT_MOBILE = 0;

type Particle = {
  x: number;
  y: number;
  size: number;
  shape: "circle" | "diamond" | "spark";
  opacityFrom: number;
  opacityTo: number;
  driftDur: number;
  pulseDur: number;
  delay: number;
  oscX: number;
};

// PRNG con semilla fija para que el output sea idéntico en cada build.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function gen(count: number, seed: number): Particle[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const size = 2 + rand() * 4;
    const shape: Particle["shape"] =
      rand() < 0.6 ? "circle" : rand() < 0.85 ? "diamond" : "spark";
    return {
      x: rand() * 100,
      y: 70 + rand() * 60, // arrancan desde abajo del viewport, suben
      size,
      shape,
      opacityFrom: 0.12 + rand() * 0.1,
      opacityTo: 0.22 + rand() * 0.2,
      driftDur: 28 + rand() * 32, // 28-60s por ciclo
      pulseDur: 4 + rand() * 4, // 4-8s
      delay: rand() * 30, // hasta 30s offset
      oscX: 4 + rand() * 11, // 4-15px amplitud
    };
  });
}

function ParticleSvg({ p, i, mobile }: { p: Particle; i: number; mobile: boolean }) {
  const className = `og-particle og-particle-${p.shape}${mobile ? " og-particle-mobile" : ""}`;
  const style = {
    left: `${p.x}%`,
    top: `${p.y}vh`,
    width: `${p.size}px`,
    height: `${p.size}px`,
    "--opa-from": p.opacityFrom,
    "--opa-to": p.opacityTo,
    "--drift-dur": `${p.driftDur}s`,
    "--pulse-dur": `${p.pulseDur}s`,
    "--osc-x": `${p.oscX}px`,
    animationDelay: `-${p.delay}s, -${p.delay * 0.7}s`,
  } as React.CSSProperties;

  if (p.shape === "circle") {
    return (
      <svg key={`p-${i}`} className={className} style={style} viewBox="0 0 10 10" aria-hidden>
        <circle cx="5" cy="5" r="5" fill="oklch(70% 0.1 72)" />
      </svg>
    );
  }
  if (p.shape === "diamond") {
    return (
      <svg key={`p-${i}`} className={className} style={style} viewBox="0 0 10 10" aria-hidden>
        <polygon points="5,0 10,5 5,10 0,5" fill="oklch(74% 0.072 72)" />
      </svg>
    );
  }
  return (
    <svg key={`p-${i}`} className={className} style={style} viewBox="0 0 10 10" aria-hidden>
      <path
        d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
        fill="oklch(86% 0.026 80)"
      />
    </svg>
  );
}

export function AnimatedBackdrop() {
  // Renderizamos los dos sets (desktop + mobile). CSS los muestra/oculta vía media query.
  const desktop = gen(PARTICLE_COUNT, 42);
  const mobile = gen(PARTICLE_COUNT_MOBILE, 1337);
  return (
    <div className="ocean-backdrop" aria-hidden="true">
      <div className="ocean-mesh" />
      <div className="ocean-particles ocean-particles-desktop">
        {desktop.map((p, i) => (
          <ParticleSvg key={`d-${i}`} p={p} i={i} mobile={false} />
        ))}
      </div>
      <div className="ocean-particles ocean-particles-mobile">
        {mobile.map((p, i) => (
          <ParticleSvg key={`m-${i}`} p={p} i={i} mobile />
        ))}
      </div>
      <div className="ocean-vignette" />
    </div>
  );
}
