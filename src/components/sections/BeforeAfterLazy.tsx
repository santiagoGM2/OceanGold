"use client";

import dynamic from "next/dynamic";

/**
 * BeforeAfter es la sección más pesada del above-the-fold tras el Hero:
 * 6 sliders con clipPath, useMotionValue y framer-motion. La cargamos
 * cuando el usuario ya pasó por el hero, conservando el aspecto reservado
 * para evitar CLS.
 */
function BeforeAfterSkeleton() {
  return (
    <section
      id="antes-despues"
      className="relative px-6 md:px-14 py-20 md:py-32 border-t border-border-subtle"
      aria-hidden="true"
    >
      <div className="max-w-7xl">
        <div className="h-3 w-24 bg-accent-gold/30 mb-5" />
        <div className="h-12 md:h-16 w-full max-w-2xl bg-surface-1/80 mb-3" />
        <div className="h-4 w-2/3 max-w-xl bg-surface-1/60 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-surface-1/70 border border-border-subtle"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ssr: true (default) — el SSR sigue rendereando HTML, pero el chunk del
// componente se aísla en su propio bundle (code-splitting). Probar con
// `ssr: false` resultó en TBT mucho peor: el chunk se descargaba justo
// tras la hidratación bloqueando el main thread.
const BeforeAfter = dynamic(
  () => import("./BeforeAfter").then((m) => ({ default: m.BeforeAfter })),
  {
    loading: BeforeAfterSkeleton,
  }
);

export default BeforeAfter;
