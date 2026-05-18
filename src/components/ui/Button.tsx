import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "gold-outline" | "gold-filled" | "ghost";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

const baseClasses =
  "inline-flex items-center justify-center gap-3 font-sans font-normal uppercase " +
  "border transition-colors duration-300 cursor-pointer " +
  "relative overflow-hidden whitespace-nowrap";

const variantClasses: Record<Variant, string> = {
  "gold-outline":
    "border-accent-gold text-accent-gold bg-transparent " +
    "hover:bg-accent-gold hover:text-surface-0",
  "gold-filled":
    "border-accent-gold bg-accent-gold text-surface-0 " +
    "hover:bg-gold-l hover:border-gold-l",
  ghost:
    "border-border-subtle text-text-muted bg-transparent " +
    "hover:border-accent-gold hover:text-accent-gold",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-5 py-2 text-[0.65rem] tracking-[0.22em]",
  md: "px-9 py-4 text-[0.72rem] tracking-[0.25em]",
  lg: "px-12 py-5 text-[0.78rem] tracking-[0.28em]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "gold-outline", size = "md", className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export function ButtonLink({
  variant = "gold-outline",
  size = "md",
  className,
  children,
  href,
  target,
  rel,
}: LinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  const finalRel = target === "_blank" ? rel ?? "noopener noreferrer" : rel;

  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={finalRel}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      target={target}
      rel={finalRel}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
