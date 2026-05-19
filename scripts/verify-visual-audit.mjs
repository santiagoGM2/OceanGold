/**
 * V5 — Auditoría visual.
 *
 * Captura screenshots a 1440px (desktop) y 375px (mobile) de cada
 * sección de la landing para revisión manual.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT_BASE = process.env.OG_OUT || join(process.cwd(), "screenshots", "faseF5", "audit");
const OUT_DESK = join(OUT_BASE, "1440");
const OUT_MOB = join(OUT_BASE, "375");
mkdirSync(OUT_DESK, { recursive: true });
mkdirSync(OUT_MOB, { recursive: true });

const SECTIONS = [
  { id: "hero", label: "hero" },
  { id: "antes-despues", label: "before-after" },
  { id: "situaciones", label: "situations" },
  { id: "testimonios", label: "testimonials" },
  { id: "alerta", label: "alert" },
  { id: "diagnostico", label: "form" },
  { id: "autoridad", label: "authority" },
];

async function captureSections(page, outDir) {
  for (const s of SECTIONS) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    }, s.id);
    await page.waitForTimeout(800);
    const p = join(outDir, `${s.label}.png`);
    await page.screenshot({ path: p, fullPage: false });
    console.log(`    ✓ ${s.label} → ${p}`);
  }

  // Footer (scroll to bottom)
  await page.evaluate(() => window.scrollTo({ top: 1e9, behavior: "instant" }));
  await page.waitForTimeout(700);
  const fp = join(outDir, `footer.png`);
  await page.screenshot({ path: fp, fullPage: false });
  console.log(`    ✓ footer → ${fp}`);
}

async function shotViewport(width, height, dpr, outDir, label) {
  console.log(`\n=== ${label} (${width}×${height}) ===`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await captureSections(page, outDir);
  await browser.close();
}

(async () => {
  await shotViewport(1440, 900, 1, OUT_DESK, "Desktop 1440");
  await shotViewport(375, 812, 2, OUT_MOB, "Mobile 375");
  console.log("\n✓ Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
