/**
 * V3 — Videos del flujo completo.
 *
 * Desktop: 1440px, 60-90s, Hero scrub + BeforeAfter + Form completo + Calendar.
 * Mobile: 375px, 30-45s, mismo flujo.
 *
 * Usa Playwright `recordVideo`. Output: screenshots/faseF5/videos/{desktop,mobile}.
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT_BASE = join(process.cwd(), "screenshots", "faseF5", "videos");
mkdirSync(OUT_BASE, { recursive: true });

const TEST_USER = {
  name: "María Fernández Test",
  phone: "+13055559876",
  email: "test@oceangold.demo",
};

async function flowDesktop() {
  console.log("\n=== Video Desktop 1440 (target ~75s) ===");
  const dir = join(OUT_BASE, "desktop");
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 1) Hero
  await page.waitForTimeout(2000);

  // 2) Scroll a BeforeAfter (welcome animation)
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "smooth" })
  );
  await page.waitForTimeout(4000);

  // 3) Interaction con slider — drag desde el handle
  const slider = await page.$('#antes-despues [role="slider"]');
  if (slider) {
    const box = await slider.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 120, cy, { steps: 12 });
      await page.waitForTimeout(400);
      await page.mouse.move(cx - 80, cy, { steps: 12 });
      await page.mouse.up();
    }
  }
  await page.waitForTimeout(1200);

  // 4) Click CTA "Mi joya merece esto"
  await page.evaluate(() => {
    const a = document.querySelector('a[data-cta-section="before_after"]');
    a?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  await page.waitForTimeout(1500);
  await page.click('a[data-cta-section="before_after"]', { force: true }).catch(() => {});
  await page.waitForTimeout(2500);

  // 5) Service select — click "Transformación"
  await page.click('button:has-text("Transformación")').catch(async () => {
    // fallback by aria-label or text
    const buttons = await page.$$('#diagnostico button');
    for (const b of buttons) {
      const t = (await b.textContent())?.toLowerCase() ?? "";
      if (t.includes("transformación")) {
        await b.click();
        break;
      }
    }
  });
  await page.waitForTimeout(2000);

  // 6) Photo upload — skip si requiere foto real, simulamos por dispatch
  // Vamos al siguiente step manualmente vía mock del state si hace falta.
  // En su lugar, llenamos directo sessionStorage para saltar a quiz.
  await page.evaluate((user) => {
    const draft = {
      service: "transformacion",
      photoUrl: "https://placeholder.demo/joya.jpg",
      photoUploaded: true,
      quizAnswers: {},
      feeling: null,
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
    sessionStorage.setItem(
      "oceangold:lead-draft:v1",
      JSON.stringify({
        step: "quiz",
        draft,
        submitted: false,
        submitting: false,
        bookingDay: null,
        bookingTime: null,
      })
    );
    location.reload();
  }, TEST_USER);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.evaluate(() =>
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant", block: "start" })
  );
  await page.waitForTimeout(1000);

  // 7) Quiz — seleccionar varias opciones + Otro
  const optionTexts = [
    "Recuperar un recuerdo importante",
    "Recuperar algo con valor sentimental",
  ];
  for (const txt of optionTexts) {
    await page.click(`#diagnostico button:has-text("${txt}")`).catch(() => {});
    await page.waitForTimeout(600);
  }
  // Click "Otro"
  await page.click('#diagnostico button:has-text("Otro")').catch(() => {});
  await page.waitForTimeout(800);
  // Type en el textarea
  const ta = await page.$('#diagnostico fieldset textarea');
  if (ta) {
    await ta.fill("Quiero que esta joya signifique algo para mi familia otra vez.");
    await page.waitForTimeout(1500);
  }

  // 8) Continuar → Step4
  await page.click('#diagnostico button:has-text("Continuar")').catch(() => {});
  await page.waitForTimeout(1500);

  // 9) Step4 — llenar contact form
  // Name + email ya prerellenados vía sessionStorage. Phone fue prefilled.
  // Re-fillemos por si acaso.
  const nameInput = await page.$('input[autocomplete="name"]');
  if (nameInput) await nameInput.fill(TEST_USER.name);
  const emailInput = await page.$('input[autocomplete="email"]');
  if (emailInput) await emailInput.fill(TEST_USER.email);
  await page.waitForTimeout(800);

  // 10) Submit → /api/lead (puede fallar si no hay GHL_WEBHOOK_URL local, ok)
  await page.click('#diagnostico button[type="submit"]').catch(() => {});
  await page.waitForTimeout(3500);

  // 11) Step5 — calendar iframe (opcional, puede no cargar sin URL real)
  await page.waitForTimeout(2500);

  await page.close();
  await ctx.close();
  await browser.close();

  // Renombrar video
  const files = readdirSync(dir).filter((f) => f.endsWith(".webm"));
  if (files.length) {
    const newest = files.sort().pop();
    const renamed = join(dir, "ocean-gold-flow-desktop.webm");
    try {
      renameSync(join(dir, newest), renamed);
      console.log(`  ✓ Video → ${renamed}`);
    } catch {}
  }
}

async function flowMobile() {
  console.log("\n=== Video Mobile 375 (target ~40s) ===");
  const dir = join(OUT_BASE, "mobile");
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    recordVideo: { dir, size: { width: 375, height: 812 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Hero (poster-only en mobile)
  await page.waitForTimeout(1500);

  // BeforeAfter snap-scroll
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "smooth" })
  );
  await page.waitForTimeout(3500);

  // Pre-fill state to jump to quiz
  await page.evaluate((user) => {
    sessionStorage.setItem(
      "oceangold:lead-draft:v1",
      JSON.stringify({
        step: "quiz",
        draft: {
          service: "transformacion",
          photoUrl: "https://placeholder.demo/joya.jpg",
          photoUploaded: true,
          quizAnswers: {},
          feeling: null,
          name: user.name,
          phone: user.phone,
          email: user.email,
        },
        submitted: false,
        submitting: false,
        bookingDay: null,
        bookingTime: null,
      })
    );
    location.reload();
  }, TEST_USER);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  await page.evaluate(() =>
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant", block: "start" })
  );
  await page.waitForTimeout(1000);

  // Tap algunos chips
  await page.click('#diagnostico button:has-text("Recuperar un recuerdo importante")').catch(() => {});
  await page.waitForTimeout(700);
  await page.click('#diagnostico button:has-text("Otro")').catch(() => {});
  await page.waitForTimeout(700);
  const ta = await page.$('#diagnostico fieldset textarea');
  if (ta) {
    await ta.fill("Esta joya es muy importante para mí.");
    await page.waitForTimeout(1500);
  }

  await page.click('#diagnostico button:has-text("Continuar")').catch(() => {});
  await page.waitForTimeout(2500);

  await page.close();
  await ctx.close();
  await browser.close();

  const files = readdirSync(dir).filter((f) => f.endsWith(".webm"));
  if (files.length) {
    const newest = files.sort().pop();
    const renamed = join(dir, "ocean-gold-flow-mobile.webm");
    try {
      renameSync(join(dir, newest), renamed);
      console.log(`  ✓ Video → ${renamed}`);
    } catch {}
  }
}

(async () => {
  await flowDesktop();
  await flowMobile();
  console.log("\n✓ Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
