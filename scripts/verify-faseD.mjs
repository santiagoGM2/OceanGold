/**
 * Verificación visual de Fase D — flujo completo del formulario.
 * Toma una screenshot de cada step en 375px y graba un video del flujo a 1440px.
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:4321";
const OUT = join(process.cwd(), "screenshots", "faseD");
mkdirSync(OUT, { recursive: true });

// 1x1 px JPEG (mismo dataURL que en test-webhook.mjs).
const TINY_JPEG_PATH = join(OUT, "tiny.jpg");

async function setupBlobInput(page) {
  // Crea un File object dentro del browser y lo asigna al input.
  await page.evaluate(async () => {
    const b64 =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8AACwgAAQABAQERAP/EABQAAQAAAAAAAAAAAAAAAAAAAAr/2gAIAQEAAD8AVN//2Q==";
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const file = new File([arr], "joya.jpg", { type: "image/jpeg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
}

async function snap(page, name, viewport) {
  const path = join(OUT, `${viewport}-${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log("  ✓", name, "→", path);
}

async function flow375() {
  console.log("=== SCREENSHOTS 375px por step ===");
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scroll al formulario
  await page.evaluate(() =>
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant" })
  );
  await page.waitForTimeout(800);

  // Step 1 — Service
  await snap(page, "01-step1-service", "375");

  // Click en la card "Transformación" para tener un quiz interesante
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes("Transformación") && b.textContent.includes("oro antiguo")
    );
    btn?.click();
  });
  await page.waitForTimeout(700);

  // Step 2 — Photo (vacío)
  await snap(page, "02-step2-photo-empty", "375");

  // Subir foto
  await setupBlobInput(page);
  // Capturar el spinner "Analizando" mientras procesa
  await page.waitForTimeout(60);
  await snap(page, "03-step2-photo-spinner", "375");
  await page.waitForTimeout(900);

  // Step 2b — AHA reveal
  await snap(page, "04-step2b-aha-reveal", "375");

  // Continuar al quiz
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().toUpperCase().includes("CONTINUAR")
    );
    btn?.click();
  });
  await page.waitForTimeout(800);

  // Step 3 — Quiz
  await snap(page, "05-step3-quiz-empty", "375");

  // Llenar respuestas del quiz (Transformación: heirloom, preserve, style)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[aria-pressed]'));
    // heirloom = Sí
    buttons.find((b) => b.textContent?.trim() === "Sí")?.click();
    // style = Vanguardista
    setTimeout(() => {
      const b2 = Array.from(document.querySelectorAll('button[aria-pressed]')).find(
        (b) => b.textContent?.trim() === "Vanguardista"
      );
      b2?.click();
    }, 100);
  });
  await page.waitForTimeout(300);
  const textareas = await page.$$("textarea");
  if (textareas[0]) await textareas[0].fill("Una piedra de mi abuela que tiene mucho significado");
  await page.waitForTimeout(200);

  // Scroll hasta los FeelingChips
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(200);
  await snap(page, "06-step3-feeling-chips", "375");

  // Seleccionar feeling "Amor"
  await page.evaluate(() => {
    const chip = Array.from(document.querySelectorAll('button[aria-pressed]')).find(
      (b) => b.textContent?.trim() === "Amor"
    );
    chip?.click();
  });
  await page.waitForTimeout(300);
  await snap(page, "07-step3-feeling-selected", "375");

  // Continuar al contacto
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().toUpperCase().includes("CONTINUAR") && !b.disabled
    );
    btn?.click();
  });
  await page.waitForTimeout(800);

  // Step 4 — Contact (vacío)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(400);
  await snap(page, "08-step4-contact-empty", "375");

  // Llenar nombre + phone + email
  const nameInput = await page.$('input[autocomplete="name"]');
  if (nameInput) await nameInput.fill("María Fernández");
  const phoneInput = await page.$('input[type="tel"]');
  if (phoneInput) {
    await phoneInput.fill("");
    // E.164 explícito para que react-phone-number-input lo parsee como US.
    await phoneInput.type("+1 305 555 1234", { delay: 25 });
  }
  const emailInput = await page.$('input[autocomplete="email"]');
  if (emailInput) await emailInput.fill("maria@example.com");
  await page.waitForTimeout(600);
  await snap(page, "09-step4-contact-filled", "375");

  // Submit (esto disparará POST /api/lead)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(
      (b) => !b.disabled
    );
    btn?.click();
  });
  // Esperar a que el submit termine (puede tardar por retry GHL).
  await page.waitForTimeout(15000);

  // Step 5 — Calendar con mensaje de reassurance arriba (si todavía visible)
  await page.evaluate(() => document.getElementById("diagnostico")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(600);
  await snap(page, "10-step5-calendar", "375");

  await browser.close();
}

async function recordFlowVideo() {
  console.log("\n=== VIDEO del flujo (1440px) ===");
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  await page.evaluate(() =>
    document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth" })
  );
  await page.waitForTimeout(1500);

  // Seleccionar Transformación
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#diagnostico button')).find(
      (b) => b.textContent?.includes("Transformación")
    );
    btn?.click();
  });
  await page.waitForTimeout(800);

  // Subir foto
  await setupBlobInput(page);
  await page.waitForTimeout(1500);

  // Continuar al quiz desde AHA
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().toUpperCase().includes("CONTINUAR")
    );
    btn?.click();
  });
  await page.waitForTimeout(1000);

  // Llenar quiz
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button[aria-pressed]')).find(
      (b) => b.textContent?.trim() === "Sí"
    )?.click();
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button[aria-pressed]')).find(
      (b) => b.textContent?.trim() === "Clásico moderno"
    )?.click();
  });
  await page.waitForTimeout(200);
  const ta = await page.$("textarea");
  if (ta) await ta.fill("Conservar la piedra original");
  await page.waitForTimeout(400);

  // Seleccionar feeling Amor
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button[aria-pressed]')).find(
      (b) => b.textContent?.trim() === "Amor"
    )?.click();
  });
  await page.waitForTimeout(800);

  // Continuar
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().toUpperCase().includes("CONTINUAR") && !b.disabled
    );
    btn?.click();
  });
  await page.waitForTimeout(1200);

  // Llenar contacto
  const nameInput = await page.$('input[autocomplete="name"]');
  if (nameInput) await nameInput.type("María Fernández", { delay: 40 });
  const phoneInput = await page.$('input[type="tel"]');
  if (phoneInput) await phoneInput.type("+1 305 555 1234", { delay: 25 });
  const emailInput = await page.$('input[autocomplete="email"]');
  if (emailInput) await emailInput.type("maria@example.com", { delay: 30 });
  await page.waitForTimeout(800);

  // Submit
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button[type="submit"]')).find(
      (b) => !b.disabled
    );
    btn?.click();
  });

  // Esperar respuesta GHL + transición a Step5
  await page.waitForTimeout(14000);

  await page.close();
  await ctx.close();
  await browser.close();

  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (files.length) {
    const newest = files.sort().pop();
    try {
      renameSync(join(videoDir, newest), join(videoDir, "leadform-full-flow.webm"));
      console.log("  ✓ Video → " + join(videoDir, "leadform-full-flow.webm"));
    } catch (e) {
      console.log("  ⚠ rename failed: " + e.message);
    }
  }
}

(async () => {
  await flow375();
  await recordFlowVideo();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
