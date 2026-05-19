/**
 * Captura el Step2Photo con el botón skip visible en mobile + desktop.
 * Inyecta sessionStorage para arrancar el form directamente en step="photo".
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "produccion-final", "F5.5-skip");
mkdirSync(OUT, { recursive: true });

const STATE_REPARACION = {
  step: "photo",
  draft: {
    service: "reparacion",
    photoUrl: null,
    photoUploaded: false,
    quizAnswers: {},
    feeling: null,
    name: "",
    phone: "",
    email: "",
  },
  submitted: false,
  submitting: false,
  bookingDay: null,
  bookingTime: null,
};

async function shot(width, height, dpr, label) {
  console.log(`=== ${label} (${width}×${height}) ===`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  const page = await ctx.newPage();
  await page.addInitScript((data) => {
    sessionStorage.setItem("oceangold:lead-draft:v1", JSON.stringify(data));
  }, STATE_REPARACION);
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  // Scroll para que el botón skip quede visible: apuntamos al dropzone
  // (label clickable) y centramos su área.
  await page.evaluate(() => {
    const dz = document.querySelector('section#diagnostico label[aria-label], section#diagnostico .lead-form-card label');
    const fallback = document.querySelector('section#diagnostico .lead-form-card');
    (dz || fallback)?.scrollIntoView({ behavior: "instant", block: "start" });
    window.scrollBy({ top: -20, behavior: "instant" });
  });
  await page.waitForTimeout(700);
  const p = join(OUT, `${width}-photo-step.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
  await browser.close();
}

(async () => {
  await shot(1440, 900, 1, "Desktop 1440 (Reparación step photo)");
  await shot(375, 812, 2, "Mobile 375 (Reparación step photo)");
  console.log("\n✓ Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
