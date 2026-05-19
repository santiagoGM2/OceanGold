/**
 * Tests del mapper de sentimientos. Corre con:
 *   node --experimental-strip-types --test src/lib/feelingMapper.test.ts
 *
 * Sin runner extra (vitest/jest) — usamos `node:test` built-in para no
 * añadir dependencias al stack. El comando está expuesto como
 * `npm run test:feeling` en package.json.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mapToFeeling } from "./feelingMapper.ts";

test("default Amor cuando no hay respuestas", () => {
  assert.equal(mapToFeeling([]), "Amor");
});

test("default Amor cuando ninguna respuesta matchea keywords", () => {
  assert.equal(mapToFeeling(["palabras sueltas sin sentido aquí"]), "Amor");
});

test("Amor — match único por keyword sentimental", () => {
  assert.equal(mapToFeeling(["Recuperar un recuerdo importante"]), "Amor");
});

test("Amor — opción 'parte de mi vida' del quiz Reparación", () => {
  assert.equal(
    mapToFeeling(["Sentir que vuelve a ser parte de mi vida"]),
    "Amor"
  );
});

test("Orgullo — keyword logro/elegancia/presencia", () => {
  assert.equal(mapToFeeling(["Un logro importante"]), "Orgullo");
});

test("Orgullo — opción 'Quiero transformarla en algo mejor' del quiz", () => {
  assert.equal(
    mapToFeeling(["Quiero transformarla en algo mejor"]),
    "Orgullo"
  );
});

test("Seguridad — keyword confianza", () => {
  assert.equal(
    mapToFeeling(["Volver a usarla con confianza"]),
    "Seguridad"
  );
});

test("Seguridad — quiz Diagnóstico 'Que siga deteriorándose'", () => {
  assert.equal(
    mapToFeeling(["Que siga deteriorándose"]),
    "Seguridad"
  );
});

test("Estatus — keyword estilo/único", () => {
  assert.equal(
    mapToFeeling(["Una pieza única que nadie más tenga"]),
    "Estatus"
  );
});

test("Estatus — quiz Armado 'Algo exclusivo y único'", () => {
  assert.equal(mapToFeeling(["Algo exclusivo y único"]), "Estatus");
});

test("Estatus — frase 'hecha para mí'", () => {
  assert.equal(
    mapToFeeling(["Como si fuera una pieza hecha para mí"]),
    "Estatus"
  );
});

test("case-insensitive: ESTILO PERSONAL → Estatus", () => {
  assert.equal(mapToFeeling(["ESTILO PERSONAL"]), "Estatus");
});

test("acumulación: varias respuestas Amor suman al mismo conteo", () => {
  assert.equal(
    mapToFeeling([
      "Recuperar un recuerdo importante",
      "Recuperar algo con valor sentimental",
      "Sentir que vuelve a ser parte de mi vida",
    ]),
    "Amor"
  );
});

test("empate Amor vs Estatus → Amor por prioridad", () => {
  // "recuerdo" (Amor) + "único" (Estatus) = 1 vs 1
  assert.equal(mapToFeeling(["recuerdo único"]), "Amor");
});

test("empate Orgullo vs Seguridad → Orgullo por prioridad", () => {
  // "logro" (Orgullo) + "confianza" (Seguridad) = 1 vs 1
  assert.equal(mapToFeeling(["logro y confianza"]), "Orgullo");
});

test("respuestas mixtas: gana el conteo mayor (Seguridad triplicado)", () => {
  // 3 keywords Seguridad vs 1 Amor → Seguridad
  assert.equal(
    mapToFeeling([
      "Quiero asegurarme de que esté bien",
      "Solo quiero una evaluación profesional",
      "Tener la tranquilidad de volver a usarla",
      "regalo especial",
    ]),
    "Seguridad"
  );
});

test("multi-select Estatus dominante (estilo + exclusivo + únic*)", () => {
  assert.equal(
    mapToFeeling([
      "Algo exclusivo y único",
      "Mi estilo personal",
      "Una pieza única que nadie más tenga",
    ]),
    "Estatus"
  );
});

test("Mantenimiento 'sentirme elegante otra vez' → Orgullo", () => {
  assert.equal(
    mapToFeeling(["Sentirme elegante otra vez"]),
    "Orgullo"
  );
});
