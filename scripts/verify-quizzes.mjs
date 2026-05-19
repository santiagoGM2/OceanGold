/**
 * Screenshots de los 6 quizzes en 375px + "Otro" expandido.
 *
 * Estrategia: inyectar sessionStorage con el draft preconfigurado para
 * cada servicio + step "quiz", recargar, capturar.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_VERIFY_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "faseF5", "quizzes");
mkdirSync(OUT, { recursive: true });

const STATE = (service, quizAnswers = {}) => ({
  step: "quiz",
  draft: {
    service,
    photoUrl: null,
    photoUploaded: true,
    quizAnswers,
    feeling: null,
    name: "",
    phone: "",
    email: "",
  },
  submitted: false,
  submitting: false,
  bookingDay: null,
  bookingTime: null,
});

const SERVICES = [
  "reparacion",
  "transformacion",
  "personalizacion",
  "mantenimiento",
  "armado",
  "diagnostico",
];

async function shotQuiz(browser, service, suffix = "", extra = {}, scrollToTextarea = false) {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.addInitScript(
    (data) => {
      sessionStorage.setItem("oceangold:lead-draft:v1", JSON.stringify(data));
    },
    STATE(service, extra)
  );
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate((scrollToTextarea) => {
    if (scrollToTextarea) {
      // Para "Otro" expandido: encuadrar el textarea visible
      const ta = document.querySelector('section#diagnostico textarea');
      if (ta) {
        ta.scrollIntoView({ behavior: "instant", block: "center" });
        return;
      }
    }
    const el = document.getElementById("diagnostico");
    if (!el) return;
    const inner = el.querySelector("h3");
    (inner ?? el).scrollIntoView({ behavior: "instant", block: "start" });
    window.scrollBy({ top: -40, behavior: "instant" });
  }, scrollToTextarea);
  await page.waitForTimeout(700);
  const p = join(OUT, `375-quiz-${service}${suffix}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  ✓ ${service}${suffix} →`, p);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    console.log("=== Quizzes 375px (mobile) ===");
    for (const s of SERVICES) {
      await shotQuiz(browser, s);
    }

    console.log('\n=== "Otro" expandido (Reparación) ===');
    // Pre-seleccionar "Otro" en el quiz Reparación para mostrar el input expandido
    await shotQuiz(
      browser,
      "reparacion",
      "-otro-expanded",
      {
        feel_when_using: {
          values: ["Recuperar un recuerdo importante", "Otro"],
          otherText:
            "Quiero que vuelva a brillar para usarla el día de mi aniversario.",
        },
      },
      true
    );
  } finally {
    await browser.close();
  }
  console.log("\n✓ Done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
