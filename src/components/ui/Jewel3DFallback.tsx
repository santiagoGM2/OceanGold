import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Fallback estático del anillo dorado. Se usa para:
 *  - SSR / loading del dynamic import de Jewel3D.
 *  - Dispositivos low-end (móvil, baja CPU) según `detectLowEnd()`.
 *  - prefers-reduced-motion (cero animación).
 */
export function Jewel3DFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/images/jewel-fallback.svg"
        alt=""
        width={600}
        height={600}
        priority={false}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
