/**
 * Captura Step4Contact con los placeholders visibles (campos vacíos).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "produccion-final", "F5.6");
mkdirSync(OUT, { recursive: true });

const STATE = {
  step: "contact",
  draft: {
    service: "reparacion",
    photoUrl: null,
    photoUploaded: true,
    quizAnswers: {
      feel_when_using: { values: ["Recuperar un recuerdo importante"], otherText: "" },
    },
    feeling: "Amor",
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
  }, STATE);
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant", block: "start" });
    window.scrollBy({ top: 180, behavior: "instant" });
  });
  await page.waitForTimeout(700);
  const p = join(OUT, `${width}-step4-placeholders.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
  await browser.close();
}

(async () => {
  await shot(1440, 900, 1, "Desktop 1440 Step4 placeholders");
  await shot(375, 812, 2, "Mobile 375 Step4 placeholders");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
