/**
 * Prueba real del flujo /api/lead → webhook GHL.
 * Envía un payload sintético al endpoint local, que internamente reenvía al webhook GHL.
 * Captura URL, headers, body y status del response.
 */

const ENDPOINT = "http://localhost:4321/api/lead";

// 1×1 pixel JPEG dataURL (placeholder, evitamos subir nada real).
const TINY_JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8AACwgAAQABAQERAP/EABQAAQAAAAAAAAAAAAAAAAAAAAr/2gAIAQEAAD8AVN//2Q==";

const payload = {
  name: "Test Lead Ocean Gold",
  phone: "+13055551234",
  email: "lead-test@oceangold.dev",
  service: "reparacion",
  feeling: "Amor",
  quizAnswers: {
    feel_when_seeing: "Nostalgia",
    stored_for: "Más de 6 meses",
    first_thing_tomorrow: "Usarla en el cumpleaños de mi mamá",
  },
  photoDataUrl: TINY_JPEG,
};

const start = Date.now();
const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const elapsed = Date.now() - start;
const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

console.log("=== REQUEST ===");
console.log("POST", ENDPOINT);
console.log("Headers: { 'Content-Type': 'application/json' }");
console.log("Body keys:", Object.keys(payload).join(", "));
console.log("photoDataUrl size:", payload.photoDataUrl.length, "chars (mini placeholder)");

console.log("\n=== RESPONSE ===");
console.log("Status:", res.status);
console.log("Time:", elapsed + "ms");
console.log("Body:", JSON.stringify(body, null, 2));

if (res.ok) {
  console.log("\n✓ Webhook contract OK — GHL aceptó el payload");
} else {
  console.log("\n⚠ El endpoint respondió no-OK. Revisa el body.");
}
