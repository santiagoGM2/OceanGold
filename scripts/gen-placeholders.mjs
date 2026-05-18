/**
 * Genera 12 SVG placeholder en public/images/before-after/
 * Cada par tiene un tono distintivo: "antes" más opaco/oscuro, "después" más brillante.
 * Los SVG incluyen un número grande y label "ANTES"/"DESPUÉS" para validar el pareo.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "images", "before-after");
mkdirSync(OUT, { recursive: true });

const PAIRS = 6;
const W = 1200;
const H = 900;

const palettes = [
  { beforeBg: "#3a3026", beforeFg: "#7a6a4f", afterBg: "#0d1410", afterFg: "#c9a84c" },
  { beforeBg: "#332e28", beforeFg: "#6f5e44", afterBg: "#0d1410", afterFg: "#d4b461" },
  { beforeBg: "#2e2a24", beforeFg: "#807055", afterBg: "#0d1410", afterFg: "#bda04a" },
  { beforeBg: "#352c25", beforeFg: "#73624a", afterBg: "#0d1410", afterFg: "#c9a84c" },
  { beforeBg: "#2f2924", beforeFg: "#7a6a52", afterBg: "#0d1410", afterFg: "#d4b461" },
  { beforeBg: "#322b25", beforeFg: "#6c5b43", afterBg: "#0d1410", afterFg: "#c9a84c" },
];

function svg({ kind, n, palette }) {
  const isBefore = kind === "before";
  const bg = isBefore ? palette.beforeBg : palette.afterBg;
  const fg = isBefore ? palette.beforeFg : palette.afterFg;
  const label = isBefore ? "ANTES" : "DESPUÉS";
  const label2 = isBefore
    ? "placeholder de desarrollo"
    : "joya recuperada · Ocean Gold";

  // Gem ring stylized vector (centered)
  const ringStroke = isBefore ? 6 : 10;
  const ringOpacity = isBefore ? 0.55 : 1;
  const sheenOpacity = isBefore ? 0 : 0.55;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label} ${String(n).padStart(2, "0")} — placeholder">
  <defs>
    <radialGradient id="g${n}-${kind}" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="55%" stop-color="${bg}" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#06090a" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="sheen${n}-${kind}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="${sheenOpacity}"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g${n}-${kind})"/>
  <!-- ring -->
  <g transform="translate(${W / 2} ${H / 2 - 30})">
    <ellipse cx="0" cy="40" rx="220" ry="60" fill="none" stroke="${fg}" stroke-opacity="${ringOpacity * 0.35}" stroke-width="${ringStroke / 1.5}"/>
    <circle cx="0" cy="0" r="180" fill="none" stroke="${fg}" stroke-opacity="${ringOpacity}" stroke-width="${ringStroke}"/>
    <circle cx="0" cy="-180" r="34" fill="${fg}" fill-opacity="${ringOpacity * 0.85}" stroke="${fg}" stroke-width="3"/>
    <!-- facetas de la gema (sólo en "después") -->
    ${
      !isBefore
        ? `<path d="M 0 -210 L 28 -180 L 0 -150 L -28 -180 Z" fill="#fff" fill-opacity="0.65"/>
           <path d="M 28 -180 L 14 -156 L 0 -150 Z" fill="#fff" fill-opacity="0.35"/>`
        : `<path d="M -8 -188 L 10 -198 L 6 -176 Z" fill="#fff" fill-opacity="0.18"/>`
    }
  </g>
  <!-- sheen -->
  <rect width="${W}" height="${H}" fill="url(#sheen${n}-${kind})"/>
  <!-- label arriba -->
  <g font-family="Georgia, 'Times New Roman', serif" fill="${fg}">
    <text x="60" y="120" font-size="38" letter-spacing="14" font-weight="300">${label}</text>
    <text x="60" y="158" font-size="18" letter-spacing="6" fill-opacity="0.7">${label2}</text>
  </g>
  <!-- número grande inferior derecho -->
  <text x="${W - 60}" y="${H - 60}" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="200" font-weight="300" fill="${fg}" fill-opacity="${isBefore ? 0.25 : 0.5}" letter-spacing="6">${String(n).padStart(2, "0")}</text>
</svg>`;
}

for (let n = 1; n <= PAIRS; n++) {
  const palette = palettes[(n - 1) % palettes.length];
  const before = svg({ kind: "before", n, palette });
  const after = svg({ kind: "after", n, palette });
  writeFileSync(join(OUT, `${String(n).padStart(2, "0")}-before.svg`), before, "utf8");
  writeFileSync(join(OUT, `${String(n).padStart(2, "0")}-after.svg`), after, "utf8");
  console.log(`  ✓ par ${String(n).padStart(2, "0")} generado`);
}

console.log(`\n${PAIRS} pares (${PAIRS * 2} archivos SVG) en ${OUT}`);
