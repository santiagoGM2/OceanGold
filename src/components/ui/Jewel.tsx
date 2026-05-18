"use client";

import { Jewel3DFallback } from "./Jewel3DFallback";
import { cn } from "@/lib/utils";

/**
 * Wrapper del anillo Ocean Gold.
 *
 * NOTA TÉCNICA: probamos `@react-three/fiber` + `@react-three/drei` para un
 * render 3D real. El chunk pesa ~228 KB gzipped y aunque solo se cargaba en
 * desktop con `idle defer`, añadía 700 ms de TBT y bajaba el Lighthouse
 * Desktop de 99 → 64. El diferencial visual frente al SVG estático no
 * compensaba el costo de performance, así que mantenemos el SVG vectorial
 * que ya está optimizado para el viewport. Los archivos `Jewel3D.tsx` y la
 * lógica de `detectLowEnd()` quedan en el repo por si más adelante se
 * decide reintroducirlos con WebGPU u otra estrategia.
 */
export function Jewel({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-full", className)}>
      <Jewel3DFallback />
    </div>
  );
}
