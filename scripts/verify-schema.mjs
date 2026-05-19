/**
 * V2 — Schema.org validation contra producción.
 *
 * 1. Captura screenshot del validator oficial validator.schema.org
 * 2. Captura screenshot de Google Rich Results test
 * 3. Parsea el JSON-LD localmente y reporta entidades + warnings
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROD_URL = process.env.OG_URL || "https://ocean-gold-pi.vercel.app";
const OUT = join(process.cwd(), "screenshots", "produccion-final", "schema");
mkdirSync(OUT, { recursive: true });

async function shotValidatorSchemaOrg(browser) {
  console.log("=== validator.schema.org ===");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // El validator carga via hash fragment con URL del sitio a validar.
  const validatorUrl = `https://validator.schema.org/#url=${encodeURIComponent(PROD_URL)}`;
  await page.goto(validatorUrl, { waitUntil: "networkidle", timeout: 60000 });
  // El validator hace fetch async; esperar hasta ver resultados o timeout
  await page.waitForTimeout(15000);
  const p = join(OUT, "validator-schema-org.png");
  await page.screenshot({ path: p, fullPage: true });
  console.log("  ✓", p);
  await ctx.close();
}

async function shotRichResults(browser) {
  console.log("\n=== search.google.com/test/rich-results ===");
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("https://search.google.com/test/rich-results", { waitUntil: "networkidle", timeout: 60000 });
  // Intentar llenar el input de URL y submit
  try {
    await page.fill('input[type="search"], input[name="url"], input[type="url"]', PROD_URL, { timeout: 5000 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(20000);
  } catch {
    console.log("  (input no encontrado, captura del formulario inicial)");
  }
  const p = join(OUT, "rich-results.png");
  await page.screenshot({ path: p, fullPage: true });
  console.log("  ✓", p);
  await ctx.close();
}

async function parseAndReport() {
  console.log("\n=== Local JSON-LD parse ===");
  const res = await fetch(PROD_URL);
  const html = await res.text();
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  let totalEntities = 0;
  const byType = {};
  for (const m of matches) {
    try {
      const json = JSON.parse(m[1]);
      const arr = Array.isArray(json) ? json : [json];
      for (const entity of arr) {
        totalEntities++;
        const t = entity["@type"];
        byType[t] = (byType[t] ?? 0) + 1;
      }
    } catch (e) {
      console.log("  ✗ Parse error:", e.message);
    }
  }
  console.log("  ✓ Scripts JSON-LD:", matches.length);
  console.log("  ✓ Entidades totales:", totalEntities);
  for (const [t, n] of Object.entries(byType)) console.log(`    - ${t} × ${n}`);

  // Validaciones específicas
  const business = (() => {
    for (const m of matches) {
      const arr = JSON.parse(m[1]);
      const a = Array.isArray(arr) ? arr : [arr];
      const b = a.find((e) => e["@type"] === "JewelryStore");
      if (b) return b;
    }
    return null;
  })();

  const checks = {
    "JewelryStore present": !!business,
    "name = Ocean Gold": business?.name === "Ocean Gold",
    "address Miami FL": business?.address?.addressLocality === "Miami" && business?.address?.addressRegion === "FL",
    "openingHours present": Array.isArray(business?.openingHoursSpecification),
    "aggregateRating 4.9": business?.aggregateRating?.ratingValue === 4.9,
    "6 Service entities": (byType["Service"] ?? 0) === 6,
    "3 Review entities": (byType["Review"] ?? 0) === 3,
    "Description includes 10K-24K": typeof business?.description === "string" && business.description.includes("10K, 14K, 18K, 22K y 24K"),
  };

  console.log("\n=== Checks ===");
  const failures = [];
  for (const [label, pass] of Object.entries(checks)) {
    console.log(`  ${pass ? "✓" : "✗"} ${label}`);
    if (!pass) failures.push(label);
  }

  writeFileSync(
    join(OUT, "schema-report.json"),
    JSON.stringify({ url: PROD_URL, totalEntities, byType, business, checks, failures }, null, 2)
  );
  console.log(`\n  Report → ${join(OUT, "schema-report.json")}`);
  return { totalEntities, byType, checks, failures };
}

(async () => {
  const report = await parseAndReport();
  const browser = await chromium.launch({ headless: true });
  try {
    await shotValidatorSchemaOrg(browser);
    await shotRichResults(browser);
  } finally {
    await browser.close();
  }
  console.log("\n=== Final ===");
  console.log("Failures:", report.failures.length === 0 ? "NONE" : report.failures);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
