"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  ariaLabel?: string;
};

export function Chip({ selected = false, onClick, children, ariaLabel }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={cn(
        "group relative px-6 py-3 text-sm tracking-wide font-sans cursor-pointer",
        "border transition-all duration-300",
        selected
          ? "border-accent-gold bg-accent-gold-soft text-text-strong shadow-[0_0_22px_oklch(65%_0.096_72/0.25)]"
          : "border-border-subtle bg-surface-1/70 text-text-muted hover:border-accent-gold/60 hover:text-text-strong"
      )}
    >
      {children}
    </button>
  );
}
