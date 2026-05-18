/**
 * Verificación visual y técnica de Fase A.
 *
 * - Screenshots a 375 / 768 / 1440 px.
 * - Captura console logs y network requests para detectar el evento landing_viewed.
 * - Extrae el bloque JSON-LD inyectado en <head>.
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:3000";
const OUT_DIR = join(process.cwd(), "screenshots");

const VIEWPORTS = [
  { name: "375-mobile", width: 375, height: 812 },
  { name: "768-tablet", width: 768, height: 1024 },
  { name: "1440-desktop", width: 1440, height: 900 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const report = { screenshots: [], consoleLogs: [], networkLogs: [], jsonLd: null };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      const text = msg.text();
      // Capturamos cualquier log que mencione analytics o Vercel
      if (
        text.toLowerCase().includes("vercel") ||
        text.toLowerCase().includes("analytics") ||
        text.toLowerCase().includes("landing_viewed")
      ) {
        report.consoleLogs.push({ vp: vp.name, type: msg.type(), text });
      }
    });

    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/_vercel/insights") || url.includes("vitals.vercel-insights")) {
        report.networkLogs.push({
          vp: vp.name,
          method: req.method(),
          url,
          postData: req.postData(),
        });
      }
    });

    await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
    // Esperar un poco más para asegurar que useEffect corrió
    await page.waitForTimeout(1500);

    const fullPath = join(OUT_DIR, `${vp.name}-fullpage.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    report.screenshots.push({ vp: vp.name, path: fullPath });

    const viewportPath = join(OUT_DIR, `${vp.name}-viewport.png`);
    await page.screenshot({ path: viewportPath, fullPage: false });
    report.screenshots.push({ vp: vp.name, path: viewportPath, viewportOnly: true });

    // Extraemos JSON-LD solo una vez (es el mismo en los 3)
    if (!report.jsonLd) {
      const ld = await page.$eval(
        'script[type="application/ld+json"]',
        (el) => el.textContent
      );
      report.jsonLd = ld;
    }

    await context.close();
  }

  await browser.close();

  writeFileSync(
    join(OUT_DIR, "report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("\n=== SCREENSHOTS ===");
  for (const s of report.screenshots) {
    console.log(`  ${s.vp}${s.viewportOnly ? " (viewport only)" : " (full page)"} → ${s.path}`);
  }

  console.log("\n=== CONSOLE LOGS (analytics-related) ===");
  if (report.consoleLogs.length === 0) {
    console.log("  (no Vercel/analytics console messages detected)");
  } else {
    for (const c of report.consoleLogs) {
      console.log(`  [${c.vp}] [${c.type}] ${c.text}`);
    }
  }

  console.log("\n=== NETWORK (Vercel Insights) ===");
  if (report.networkLogs.length === 0) {
    console.log("  (no requests to /_vercel/insights detected — expected in local dev)");
  } else {
    for (const n of report.networkLogs) {
      console.log(`  [${n.vp}] ${n.method} ${n.url}`);
      if (n.postData) console.log(`    body: ${n.postData}`);
    }
  }

  console.log("\n=== JSON-LD ===");
  if (report.jsonLd) {
    try {
      const parsed = JSON.parse(report.jsonLd);
      console.log(`  ✓ JSON-LD válido — ${Array.isArray(parsed) ? parsed.length : 1} entidades`);
      if (Array.isArray(parsed)) {
        const types = parsed.map((p) => p["@type"]).reduce((acc, t) => {
          acc[t] = (acc[t] ?? 0) + 1;
          return acc;
        }, {});
        for (const [t, n] of Object.entries(types)) console.log(`    - ${t} × ${n}`);
      }
    } catch (e) {
      console.log(`  ✗ JSON-LD inválido: ${e.message}`);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
