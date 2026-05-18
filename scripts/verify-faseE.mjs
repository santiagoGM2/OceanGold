/**
 * Verificación Fase E.
 *  - Video del Hero con Jewel3D rotando en desktop.
 *  - Screenshot del Hero en mobile (debe ver Jewel3DFallback SVG, sin 3D).
 *  - Captura de prefers-reduced-motion (animaciones detenidas).
 *  - Schema validator local (parsing + audit de campos requeridos).
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:4321";
const OUT = join(process.cwd(), "screenshots", "faseE");
mkdirSync(OUT, { recursive: true });

async function recordHeroJewelVideo() {
  console.log("=== VIDEO Hero con Jewel3D (1440px) ===");
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  // Forzar que el idle se evalúe disparando la condición manualmente si no llegó.
  await page.waitForTimeout(2000);
  // Esperar a que aparezca el <canvas> que Three.js inyecta cuando termina de cargar.
  try {
    await page.waitForSelector("canvas", { timeout: 12000 });
  } catch {}
  await page.waitForTimeout(4000);
  await page.close();
  await ctx.close();
  await browser.close();
  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (files.length) {
    const newest = files.sort().pop();
    try {
      renameSync(join(videoDir, newest), join(videoDir, "hero-jewel3d-desktop.webm"));
      console.log("  ✓ Video → " + join(videoDir, "hero-jewel3d-desktop.webm"));
    } catch {}
  }
}

async function captureMobileFallback() {
  console.log("\n=== Mobile Hero con Jewel3DFallback (375px) ===");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const path = join(OUT, "375-hero-fallback.png");
  await page.screenshot({ path, fullPage: false });
  console.log("  ✓", path);

  // Verificar que el chunk Three.js NO se descargó en mobile.
  const chunks = [];
  await page.evaluate(() => performance.getEntriesByType("resource"));
  const perfEntries = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((e) => e.name.includes("/_next/static/chunks/") && e.name.endsWith(".js"))
      .map((e) => ({ name: e.name.split("/").pop(), size: e.transferSize }))
  );
  console.log("  mobile chunks loaded:", perfEntries.length);
  await browser.close();
  return perfEntries;
}

async function captureDesktop3D() {
  console.log("\n=== Desktop Hero con Jewel3D real (1440px) ===");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector("canvas", { timeout: 12000 });
  } catch {}
  // Esperar 2 frames del 3D para asegurar que está renderizado
  await page.waitForTimeout(2000);
  const path = join(OUT, "1440-hero-3d.png");
  await page.screenshot({ path, fullPage: false });
  console.log("  ✓", path);
  const perfEntries = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((e) => e.name.includes("/_next/static/chunks/") && e.name.endsWith(".js"))
      .map((e) => ({ name: e.name.split("/").pop(), size: e.transferSize }))
  );
  console.log("  desktop chunks loaded:", perfEntries.length);
  await browser.close();
  return perfEntries;
}

async function captureReducedMotion() {
  console.log("\n=== prefers-reduced-motion (1440px) ===");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const path = join(OUT, "1440-hero-reduced-motion.png");
  await page.screenshot({ path, fullPage: false });
  console.log("  ✓ Hero reduced-motion →", path);

  // Verificar que todo el contenido sigue visible.
  const checks = await page.evaluate(() => {
    const t = (sel) => {
      const el = document.querySelector(sel);
      return el ? { exists: true, visible: getComputedStyle(el).opacity !== "0", text: el.textContent?.trim().slice(0, 70) } : { exists: false };
    };
    return {
      heroTitle: t("#hero h1"),
      heroSubtitle: t("#hero p"),
      heroCta: t('a[data-cta-section="hero"]'),
      situationsTitle: t("#situaciones h2"),
      formSection: t("#diagnostico"),
    };
  });

  // Scroll a la sección antes-después y capturar
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "instant" })
  );
  await page.waitForTimeout(800);
  const baPath = join(OUT, "1440-beforeafter-reduced-motion.png");
  await page.screenshot({ path: baPath, fullPage: false });
  console.log("  ✓ BeforeAfter reduced-motion →", baPath);

  await browser.close();
  return checks;
}

async function validateSchema() {
  console.log("\n=== Schema.org validator (local) ===");
  const res = await fetch(URL);
  const html = await res.text();
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  let totalEntities = 0;
  let valid = true;
  const types = {};
  for (const m of matches) {
    try {
      const json = JSON.parse(m[1]);
      const arr = Array.isArray(json) ? json : [json];
      for (const entity of arr) {
        totalEntities++;
        const t = entity["@type"];
        types[t] = (types[t] ?? 0) + 1;
      }
    } catch (e) {
      console.log("  ✗ JSON-LD inválido:", e.message);
      valid = false;
    }
  }
  console.log("  ✓ JSON-LD scripts:", matches.length);
  console.log("  ✓ Entidades totales:", totalEntities);
  for (const [t, n] of Object.entries(types)) console.log(`    - ${t} × ${n}`);

  // Validaciones específicas para Ocean Gold
  const ldArr = JSON.parse(matches[0][1]);
  const business = ldArr.find((e) => e["@type"] === "JewelryStore");
  const required = ["name", "url", "address", "openingHoursSpecification", "aggregateRating"];
  const businessOk = required.every((k) => business?.[k] !== undefined);
  console.log(`  ${businessOk ? "✓" : "✗"} JewelryStore tiene ${required.join(", ")}`);
  const addr = business?.address ?? {};
  const addrOk = addr.streetAddress && addr.addressLocality === "Miami" && addr.addressRegion === "FL";
  console.log(`  ${addrOk ? "✓" : "✗"} Address: ${addr.streetAddress} · ${addr.addressLocality}, ${addr.addressRegion}`);
  const ratingOk = business?.aggregateRating?.ratingValue === 4.9;
  console.log(`  ${ratingOk ? "✓" : "✗"} AggregateRating ${business?.aggregateRating?.ratingValue} (${business?.aggregateRating?.reviewCount} reviews)`);

  return { valid, totalEntities, types, businessOk, addrOk, ratingOk };
}

(async () => {
  const mobileChunks = await captureMobileFallback();
  const desktopChunks = await captureDesktop3D();
  await recordHeroJewelVideo();
  const reducedChecks = await captureReducedMotion();
  const schemaReport = await validateSchema();

  const diff = desktopChunks.filter((dc) => !mobileChunks.find((mc) => mc.name === dc.name));
  console.log("\n=== Chunks only on desktop (Three.js bundle) ===");
  diff.forEach((c) => console.log("  +" + (c.size / 1024).toFixed(1) + " KB | " + c.name));
  const threeBundleKb = diff.reduce((s, c) => s + c.size, 0) / 1024;
  console.log("  Three.js bundle size (transfer):", threeBundleKb.toFixed(1), "KB");

  console.log("\n=== prefers-reduced-motion content visibility ===");
  for (const [k, v] of Object.entries(reducedChecks)) {
    if (!v.exists) console.log(`  ✗ ${k}: NO encontrado`);
    else console.log(`  ${v.visible ? "✓" : "✗"} ${k}: visible="${v.visible}" text="${v.text}"`);
  }

  writeFileSync(
    join(OUT, "report.json"),
    JSON.stringify({ mobileChunks, desktopChunks, diff, schemaReport, reducedChecks }, null, 2)
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
