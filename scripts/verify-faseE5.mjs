/**
 * Verificación visual de Fase E.5.
 * - Video desktop largo (~35s) recorriendo toda la landing
 * - Video mobile (~18s) recorriendo en 375px
 * - Video reduced-motion (~8s) confirmando que todo queda quieto
 * - Screenshots de cada sección post-E.5
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:4321";
const OUT = join(process.cwd(), "screenshots", "faseE5");
mkdirSync(OUT, { recursive: true });

async function smoothScroll(page, targetY, durationMs = 1500) {
  const start = await page.evaluate(() => window.scrollY);
  const steps = Math.ceil(durationMs / 30);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    const y = start + (targetY - start) * eased;
    await page.evaluate((p) => window.scrollTo(0, p), y);
    await page.waitForTimeout(30);
  }
}

async function recordDesktopFlow() {
  console.log("=== VIDEO desktop 1440px recorriendo landing ===");
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500); // dejar que Hero se anime palabra a palabra

  const ids = ["antes-despues", "situaciones", "testimonios", "alerta", "diagnostico", "autoridad"];
  for (const id of ids) {
    const target = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY - 40 : null;
    }, id);
    if (target !== null) {
      await smoothScroll(page, target, 2500);
      await page.waitForTimeout(2500); // pausa para ver la animación
    }
  }

  await page.close();
  await ctx.close();
  await browser.close();
  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (files.length) {
    const newest = files.sort().pop();
    renameSync(join(videoDir, newest), join(videoDir, "desktop-full-tour.webm"));
    console.log("  ✓ Video → " + join(videoDir, "desktop-full-tour.webm"));
  }
}

async function recordMobileFlow() {
  console.log("\n=== VIDEO mobile 375px recorriendo landing ===");
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    recordVideo: { dir: videoDir, size: { width: 375, height: 812 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const ids = ["antes-despues", "situaciones", "testimonios", "alerta", "autoridad"];
  for (const id of ids) {
    const target = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY - 30 : null;
    }, id);
    if (target !== null) {
      await smoothScroll(page, target, 1500);
      await page.waitForTimeout(1200);
    }
  }
  await page.close();
  await ctx.close();
  await browser.close();
  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm") && f.startsWith("page@"));
  if (files.length) {
    const newest = files.sort().pop();
    renameSync(join(videoDir, newest), join(videoDir, "mobile-full-tour.webm"));
    console.log("  ✓ Video → " + join(videoDir, "mobile-full-tour.webm"));
  }
}

async function recordReducedMotion() {
  console.log("\n=== VIDEO reduced-motion (1440px, sin animaciones) ===");
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await smoothScroll(page, 900, 1500);
  await page.waitForTimeout(800);
  await smoothScroll(page, 2200, 1500);
  await page.waitForTimeout(800);
  await smoothScroll(page, 3500, 1500);
  await page.waitForTimeout(800);
  await page.close();
  await ctx.close();
  await browser.close();
  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm") && f.startsWith("page@"));
  if (files.length) {
    const newest = files.sort().pop();
    renameSync(join(videoDir, newest), join(videoDir, "reduced-motion-tour.webm"));
    console.log("  ✓ Video → " + join(videoDir, "reduced-motion-tour.webm"));
  }
}

async function snapSections() {
  console.log("\n=== SCREENSHOTS post-E.5 ===");
  for (const [vp, w, h] of [
    ["375", 375, 812],
    ["1440", 1440, 900],
  ]) {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // pre-warm scroll para disparar todos los inView con TIEMPO para que motion complete
    const total = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 1; i <= 6; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.floor((total * i) / 6));
      await page.waitForTimeout(1800); // tiempo para que motion termine la animación
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(800);

    const ids = ["hero", "antes-despues", "situaciones", "testimonios", "alerta", "diagnostico", "autoridad"];
    for (const id of ids) {
      const handle = await page.$("#" + id);
      if (!handle) continue;
      await handle.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800); // tiempo para que las animaciones de entrada terminen
      const path = join(OUT, `${vp}-${id}.png`);
      await handle.screenshot({ path });
      console.log(`  ✓ ${vp}px ${id}`);
    }
    await browser.close();
  }
}

(async () => {
  await snapSections();
  await recordDesktopFlow();
  await recordMobileFlow();
  await recordReducedMotion();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
