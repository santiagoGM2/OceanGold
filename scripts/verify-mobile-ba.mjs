/**
 * Captura el BeforeAfter mobile con los dots visibles.
 * Scrollea para que el slider + dots queden en viewport.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "produccion-final", "F5.4");
mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Scroll al BeforeAfter pero un poco más arriba para que el slider + dots
  // quepan en el viewport.
  await page.evaluate(() => {
    const slider = document.querySelector('section#antes-despues [role="slider"]');
    if (slider) slider.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(1500);
  const p1 = join(OUT, "375-ba-with-dots.png");
  await page.screenshot({ path: p1, fullPage: false });
  console.log("  ✓", p1);

  // Capturar tras esperar 4s para ver el auto-advance al siguiente par
  await page.waitForTimeout(4000);
  const p2 = join(OUT, "375-ba-after-advance.png");
  await page.screenshot({ path: p2, fullPage: false });
  console.log("  ✓ (after 4s auto-advance)", p2);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
