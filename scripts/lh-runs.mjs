/**
 * Corre Lighthouse N veces para mobile + desktop, imprime las medianas de
 * performance score, LCP, TBT, CLS, SI, FCP. Diseñado para usar local.
 * Borrar al cerrar Fase F.5.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_LH_URL || "http://localhost:3001";
const RUNS = Number(process.env.OG_LH_RUNS || 5);
const OUT_DIR = join(process.cwd(), "screenshots", "faseF5", "lighthouse");
mkdirSync(OUT_DIR, { recursive: true });

const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function runLighthouse(preset, idx) {
  const outPath = join(OUT_DIR, `${preset}-${idx}.json`);
  return new Promise((resolve, reject) => {
    const args = [
      "--yes",
      "lighthouse@12.8.2",
      URL,
      "--quiet",
      "--output=json",
      `--output-path=${outPath}`,
      "--only-categories=performance",
      "--chrome-flags=--headless=new --disable-gpu --no-sandbox",
    ];
    if (preset === "desktop") args.push("--preset=desktop");
    else args.push("--form-factor=mobile");
    const p = spawn("npx", args, {
      env: { ...process.env, CHROME_PATH },
      shell: true,
    });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => {
      if (code !== 0) return reject(new Error(`LH ${preset} run ${idx} failed (${code}): ${stderr}`));
      try {
        const json = JSON.parse(readFileSync(outPath, "utf8"));
        const a = json.audits;
        resolve({
          score: json.categories.performance.score * 100,
          lcp: a["largest-contentful-paint"].numericValue,
          fcp: a["first-contentful-paint"].numericValue,
          tbt: a["total-blocking-time"].numericValue,
          cls: a["cumulative-layout-shift"].numericValue,
          si: a["speed-index"].numericValue,
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function suite(preset) {
  const results = [];
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`  ${preset} run ${i}/${RUNS} ... `);
    try {
      const r = await runLighthouse(preset, i);
      results.push(r);
      console.log(
        `score=${r.score.toFixed(0)}  LCP=${(r.lcp / 1000).toFixed(2)}s  TBT=${r.tbt.toFixed(0)}ms`
      );
    } catch (e) {
      console.log("FAIL", e.message);
    }
  }
  if (!results.length) return null;
  const medians = {
    score: median(results.map((r) => r.score)),
    lcp: median(results.map((r) => r.lcp)),
    fcp: median(results.map((r) => r.fcp)),
    tbt: median(results.map((r) => r.tbt)),
    cls: median(results.map((r) => r.cls)),
    si: median(results.map((r) => r.si)),
  };
  console.log(
    `  ${preset} MEDIAN: score=${medians.score.toFixed(0)}  LCP=${(medians.lcp / 1000).toFixed(2)}s  FCP=${(medians.fcp / 1000).toFixed(2)}s  TBT=${medians.tbt.toFixed(0)}ms  CLS=${medians.cls.toFixed(3)}  SI=${(medians.si / 1000).toFixed(2)}s`
  );
  return { results, medians };
}

(async () => {
  console.log(`=== Lighthouse ${RUNS} corridas mobile + ${RUNS} desktop ===`);
  console.log("URL:", URL);
  console.log("Chrome:", CHROME_PATH);
  console.log();
  console.log("MOBILE");
  const mobile = await suite("mobile");
  console.log("\nDESKTOP");
  const desktop = await suite("desktop");
  const summary = { url: URL, runs: RUNS, mobile, desktop };
  writeFileSync(join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));
  console.log("\n✓ summary →", join(OUT_DIR, "summary.json"));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
