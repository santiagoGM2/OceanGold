import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export function Card({ children, className, interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border-subtle bg-surface-1/95 p-8 backdrop-blur-sm",
        interactive &&
          "cursor-pointer transition-[transform,background,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-accent-gold/60 hover:bg-surface-2/95 hover:shadow-[0_14px_38px_oklch(65%_0.096_72/0.18)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
