"use client";

import { useEffect, useState } from "react";

/**
 * Barra horizontal de 2px fija arriba que indica progreso de scroll.
 * Cero dependencias de motion; usa `scrollY / (scrollHeight - innerHeight)`.
 */
export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? (window.scrollY / max) * 100 : 0;
        setPct(Math.max(0, Math.min(100, p)));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-gold-dim via-accent-gold to-gold-l transition-[width] duration-75 ease-linear shadow-[0_0_12px_oklch(65%_0.096_72/0.6),0_0_22px_oklch(65%_0.096_72/0.3)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
