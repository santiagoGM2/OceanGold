"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Cliente invisible que dispara analytics globales:
 * - landing_viewed en mount (una sola vez).
 * - cta_clicked por delegación a cualquier elemento con `data-cta-section`.
 */
export function LandingTracker() {
  useEffect(() => {
    track("landing_viewed");

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const cta = target?.closest<HTMLElement>("[data-cta-section]");
      if (!cta) return;
      const section = cta.dataset.ctaSection ?? "unknown";
      const label = cta.dataset.ctaLabel ?? cta.innerText.trim().slice(0, 80);
      track("cta_clicked", { section, label });
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
