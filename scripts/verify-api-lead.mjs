/**
 * V4 — Functional test del endpoint /api/lead.
 *
 * Construye un payload realista y lo envía al endpoint. El handler:
 *   1. Valida con Zod
 *   2. Sube foto a Vercel Blob si vino como data URL
 *   3. Construye payload GHL y hace POST con retry x3
 *
 * Para usar contra preview público pasar OG_URL.
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const URL = process.env.OG_URL || "http://localhost:3001";
const OUT = join(process.cwd(), "screenshots", "faseF5");
mkdirSync(OUT, { recursive: true });

// Payload realista: transformación, sentimiento Amor calculado, foto base64 1x1 pixel
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const DATA_URL = `data:image/png;base64,${TINY_PNG_BASE64}`;

const payload = {
  name: "TEST Auditoria Public Preview",
  phone: "+15555550199",
  email: "test-audit-f5@oceangold.demo",
  service: "transformacion",
  feeling: "Amor",
  quizAnswers: {
    feel_when_using:
      "Recuperar un recuerdo importante | Recuperar algo con valor sentimental | Otro: Esta joya es muy importante para mi familia",
  },
  photoDataUrl: DATA_URL,
};

console.log("=== V4 — POST /api/lead ===");
console.log("URL:", URL + "/api/lead");
console.log("name:", payload.name);
console.log("phone:", payload.phone);
console.log("service:", payload.service);
console.log("feeling:", payload.feeling);
console.log();

const t0 = Date.now();
let res, json;
try {
  res = await fetch(`${URL}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 500) };
  }
} catch (e) {
  console.error("✗ Request failed:", e instanceof Error ? e.message : e);
  process.exit(1);
}
const elapsed = Date.now() - t0;

console.log(`HTTP ${res.status}`);
console.log(`Elapsed: ${elapsed}ms`);
console.log(`Response: ${JSON.stringify(json, null, 2)}`);
console.log();

const result = {
  url: URL,
  endpoint: "/api/lead",
  request: payload,
  responseStatus: res.status,
  responseBody: json,
  elapsedMs: elapsed,
  timestamp: new Date().toISOString(),
};
writeFileSync(join(OUT, "v4-api-lead-result.json"), JSON.stringify(result, null, 2));
console.log(`✓ Result → ${join(OUT, "v4-api-lead-result.json")}`);

if (json.ok === true) {
  console.log("\n✅ PASS:");
  console.log(`  retries: ${json.retries ?? 0}`);
  console.log(`  photoUrl: ${json.photoUrl || "(empty)"}`);
  console.log(
    "  → Lead enviado a GHL. Verifica manualmente el contacto 'TEST Auditoria Public Preview' y bórralo."
  );
} else {
  console.log("\n⚠️ NOT OK:");
  console.log(`  error: ${json.error}`);
  console.log(`  retries: ${json.retries ?? 0}`);
  if (json.issues) console.log(`  issues: ${JSON.stringify(json.issues, null, 2)}`);
}
