/**
 * Verificación Fase F.5 Mini-Bloque 1B + 1C.
 * - Screenshots del Hero con video deferred autoplay (mobile poster-only,
 *   luego play tras requestIdleCallback).
 * - Screenshots de BeforeAfter con las 5 webp reales.
 * - Validación error email obligatorio en Step4Contact.
 *
 * Se borra al cerrar Fase F.5.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_VERIFY_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "faseF5");
mkdirSync(OUT, { recursive: true });

async function shot(name, fn) {
  console.log(`\n=== ${name} ===`);
  const browser = await chromium.launch({ headless: true });
  try {
    await fn(browser, name);
  } finally {
    await browser.close();
  }
}

async function heroDesktop(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const p = join(OUT, "1440-hero.png");
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
}

async function heroMobile(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "load" });
  // Captura inmediata: en mobile el video debería estar diferido (poster).
  await page.waitForTimeout(400);
  const initialPath = join(OUT, "375-hero-initial.png");
  await page.screenshot({ path: initialPath, fullPage: false });
  console.log("  ✓ (initial, debería ser poster)", initialPath);

  // Esperar a que el idle dispare attach+play (timeout 3000ms).
  await page.waitForTimeout(4500);
  const afterIdle = join(OUT, "375-hero-after-idle.png");
  await page.screenshot({ path: afterIdle, fullPage: false });
  console.log("  ✓ (post-idle, video debería estar reproduciéndose)", afterIdle);

  const videoState = await page.evaluate(() => {
    const v = document.querySelector("section#hero video");
    if (!v) return null;
    return {
      sources: v.querySelectorAll("source").length,
      currentSrc: v.currentSrc,
      paused: v.paused,
      readyState: v.readyState,
      currentTime: v.currentTime,
    };
  });
  console.log("  videoState:", videoState);
}

async function beforeAfterDesktop(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "instant", block: "start" })
  );
  await page.waitForTimeout(1500);
  const p = join(OUT, "1440-beforeafter-page1.png");
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);

  // Segunda página del carousel — fuerza click (el botón vive en opacity-0 hasta hover)
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Página siguiente"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(1200);
  const p2 = join(OUT, "1440-beforeafter-page2.png");
  await page.screenshot({ path: p2, fullPage: false });
  console.log("  ✓ (page 2)", p2);

  // Inspect resources to confirm webp pairs load
  const ba = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((e) => e.name.includes("/before-after/") && e.name.endsWith(".webp"))
      .map((e) => ({
        file: e.name.split("/").pop(),
        size: e.transferSize,
      }))
  );
  console.log("  before-after webps loaded:", ba.length);
  ba.forEach((r) => console.log(`    ${r.file}  ${(r.size / 1024).toFixed(1)}KB`));
}

async function beforeAfterMobile(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "instant", block: "start" })
  );
  await page.waitForTimeout(1500);
  const p = join(OUT, "375-beforeafter.png");
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
}

async function emailValidation(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Naveguemos al form. Clickear primer service card de Situations.
  await page.evaluate(() => {
    const card = document.querySelector('#situaciones button, #situaciones [data-cta-section]');
    if (card) card.click();
  });
  await page.waitForTimeout(800);

  // Si abre en step photo, saltar manualmente por dispatch a Step3 luego Step4.
  // Aquí simplemente vamos a forzar el step="contact" via sessionStorage hack.
  await page.evaluate(() => {
    const STATE = {
      step: "contact",
      draft: {
        service: "reparacion",
        photoUrl: null,
        photoUploaded: true,
        quizAnswers: { feel_when_seeing: "Orgullo" },
        feeling: "Orgullo",
        name: "Test",
        phone: "+15555550100",
        email: "",
      },
      submitted: false,
      submitting: false,
      bookingDay: null,
      bookingTime: null,
    };
    sessionStorage.setItem("oceangold:lead-draft:v1", JSON.stringify(STATE));
    location.reload();
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.evaluate(() =>
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant", block: "start" })
  );
  await page.waitForTimeout(800);

  // Trigger submit con email vacío
  const submitBtn = await page.locator('button[type="submit"]').first();
  await submitBtn.click().catch(() => {});
  await page.waitForTimeout(500);
  const p = join(OUT, "step4-email-required.png");
  await page.screenshot({ path: p, fullPage: false });
  console.log("  ✓", p);
}

(async () => {
  await shot("Hero desktop 1440", heroDesktop);
  await shot("Hero mobile 375 — deferred autoplay", heroMobile);
  await shot("BeforeAfter desktop 1440 — 5 webp pairs", beforeAfterDesktop);
  await shot("BeforeAfter mobile 375", beforeAfterMobile);
  await shot("Step4 email required validation", emailValidation);
  writeFileSync(
    join(OUT, "verify-1c.json"),
    JSON.stringify({ url: URL, completedAt: new Date().toISOString() }, null, 2)
  );
  console.log("\n✓ Done. Screenshots en:", OUT);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
