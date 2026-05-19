/**
 * Captura screenshots de la nueva sección Gift en 1440 + 375.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT = process.env.OG_OUT || join(process.cwd(), "screenshots", "produccion-final", "F5.1", "gift");
mkdirSync(OUT, { recursive: true });

async function shot(width, height, dpr, label) {
  console.log(`=== ${label} (${width}×${height}) ===`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const el = document.getElementById("regalo");
    if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
  });
  // Esperar a que el video tenga 2-3 frames reproducidos en desktop
  await page.waitForTimeout(width >= 1024 ? 6000 : 2500);
  // Verificar que la sección tiene contenido y el video
  const info = await page.evaluate(() => {
    const sec = document.getElementById("regalo");
    if (!sec) return null;
    const r = sec.getBoundingClientRect();
    const v = sec.querySelector("video");
    const vr = v?.getBoundingClientRect();
    return {
      sectionTop: r.top,
      sectionH: r.height,
      hasVideo: !!v,
      videoVisible: vr ? vr.width > 0 && vr.height > 0 : false,
      videoW: vr?.width ?? 0,
      videoH: vr?.height ?? 0,
      videoSrcCount: v?.querySelectorAll("source").length ?? 0,
      videoCurrentTime: v?.currentTime ?? 0,
    };
  });
  console.log("  info:", JSON.stringify(info));
  const p = join(OUT, `${width}-gift.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
  await browser.close();
}

(async () => {
  await shot(1440, 900, 1, "Desktop");
  await shot(375, 812, 2, "Mobile");
  console.log("\n✓ Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
