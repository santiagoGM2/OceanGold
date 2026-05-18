/**
 * Verificación visual de Fase B.
 *
 * - Screenshots full-page de cada sección a 375 / 1440 px.
 * - Video corto del Hero a 1440 px con animaciones corriendo.
 * - Captura comparativa con `prefers-reduced-motion: reduce` para confirmar
 *   que el contenido sigue visible y las animaciones están desactivadas.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:3000";
const OUT = join(process.cwd(), "screenshots", "faseB");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "1440", width: 1440, height: 900 },
];

const SECTIONS = [
  { id: "hero", label: "hero" },
  { id: "testimonios", label: "testimonials" },
  { id: "alerta", label: "alert" },
  { id: "autoridad", label: "authority" },
];

async function captureSections(vp, reduceMotion) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    reducedMotion: reduceMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const suffix = reduceMotion ? "-reduced" : "";

  // Pre-warm: scrollear hasta el final lentamente para disparar todos los `useInView`,
  // luego volver al inicio. Tras esto, todos los AnimatedCounter habrán completado.
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.floor((scrollHeight * i) / steps));
    await page.waitForTimeout(reduceMotion ? 200 : 900);
  }
  await page.waitForTimeout(reduceMotion ? 200 : 2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);

  const fullPath = join(OUT, `${vp.name}-fullpage${suffix}.png`);
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`  ✓ ${vp.name}px full-page${suffix} → ${fullPath}`);

  for (const sec of SECTIONS) {
    const handle = await page.$(`#${sec.id}`);
    if (!handle) continue;
    await handle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(reduceMotion ? 200 : 600);
    const path = join(OUT, `${vp.name}-${sec.label}${suffix}.png`);
    await handle.screenshot({ path });
    console.log(`  ✓ ${vp.name}px ${sec.label}${suffix} → ${path}`);
  }
  await browser.close();
}

async function recordHeroVideo() {
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Capturamos 7 segundos: animación de entrada (~1.5s), counters (~1.8s), pulso CTA (5s ciclo).
  await page.waitForTimeout(7500);
  await page.close();
  await context.close();
  await browser.close();
  console.log(`  ✓ Hero video → ${videoDir}/<auto-named>.webm`);
}

async function verifyReducedMotionContent() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(500);

  const checks = await page.evaluate(() => {
    const t = (sel) => {
      const el = document.querySelector(sel);
      return el ? { exists: true, visible: getComputedStyle(el).opacity !== "0", text: el.textContent?.trim().slice(0, 90) } : { exists: false };
    };
    return {
      heroTitle: t("#hero h1"),
      heroSubtitle: t("#hero p"),
      heroCta: t('a[data-cta-section="hero"]'),
      testimonialsTitle: t("#testimonios h2"),
      alertTitle: t("#alerta h2"),
      authorityTitle: t("#autoridad h2"),
    };
  });

  await browser.close();
  return checks;
}

(async () => {
  console.log("=== SCREENSHOTS ===");
  for (const vp of VIEWPORTS) {
    await captureSections(vp, false);
  }

  console.log("\n=== HERO VIDEO (1440px, animations on) ===");
  await recordHeroVideo();

  console.log("\n=== PREFERS-REDUCED-MOTION (1440px) ===");
  await captureSections({ name: "1440", width: 1440, height: 900 }, true);

  console.log("\n=== VERIFICATION: content visible bajo reduced-motion ===");
  const checks = await verifyReducedMotionContent();
  for (const [k, v] of Object.entries(checks)) {
    if (!v.exists) {
      console.log(`  ✗ ${k}: NO encontrado en DOM`);
      continue;
    }
    console.log(`  ${v.visible ? "✓" : "✗"} ${k}: visible=${v.visible} text="${v.text}"`);
  }
  writeFileSync(join(OUT, "reduced-motion-checks.json"), JSON.stringify(checks, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
