/**
 * Rasteriza los 10 SVGs preservando viewBox + clip-paths + transforms.
 *
 * Por qué NO extraer la base64 PNG y resize: el SVG aplica
 * transform="matrix(1.88, 0, 0, 1.88, -141, -246)" + clipPath portrait 1260×1500
 * + clipPath con bordes redondeados (radius 15). Extraer el PNG embebido
 * te da el landscape 1536×1024 SIN crop ni rounded corners — visualmente
 * diferente del SVG.
 *
 * Sharp rasteriza el SVG completo con todas sus transformaciones.
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = join(process.cwd(), "public", "images", "before-after");
const TARGET_WIDTH = 1100; // suficiente para next/image que sirve hasta 3840w
const QUALITY = 85;

const results = [];

for (let i = 1; i <= 10; i++) {
  const svgPath = join(DIR, `${i}.svg`);
  const webpPath = join(DIR, `${i}.webp`);

  const svgBuffer = readFileSync(svgPath);
  const original = statSync(svgPath).size;

  // Rasterizar manteniendo viewBox 1260×1500 → 5:6 portrait
  // density: ajusta DPI virtual para mayor calidad de raster
  const out = await sharp(svgBuffer, { density: 200 })
    .resize({ width: TARGET_WIDTH })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();

  const meta = await sharp(out).metadata();
  writeFileSync(webpPath, out);

  results.push({ i, original, newSize: out.length, w: meta.width, h: meta.height });
  console.log(
    `  ✓ ${i}.webp  ${meta.width}x${meta.height}  ${(out.length / 1024).toFixed(0)} KB  (from ${(original / 1024 / 1024).toFixed(2)} MB SVG)`
  );
}

const totalOld = results.reduce((s, r) => s + r.original, 0);
const totalNew = results.reduce((s, r) => s + r.newSize, 0);
console.log(`\nTOTAL webp: ${(totalNew / 1024 / 1024).toFixed(2)} MB (from ${(totalOld / 1024 / 1024).toFixed(2)} MB SVG)`);

const aspects = results.map((r) => r.w / r.h);
const min = Math.min(...aspects).toFixed(3);
const max = Math.max(...aspects).toFixed(3);
const avg = (aspects.reduce((a, b) => a + b, 0) / aspects.length).toFixed(3);
console.log(`Aspect ratios: min=${min}, max=${max}, avg=${avg}  (target ~0.840 = 1260/1500 portrait)`);
