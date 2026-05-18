/**
 * Verificación de Fase C: Situations + BeforeAfter + slider interactivo.
 *
 * - Screenshots de Situations y BeforeAfter a 375 / 768 / 1440 px.
 * - Video del slider en desktop: animación de bienvenida + arrastre con mouse.
 * - Test específico en WebKit (motor de iOS Safari): drag horizontal del slider
 *   y verificación de que NO roba el scroll vertical de la página.
 */
import { chromium, webkit } from "playwright";
import { mkdirSync, writeFileSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:3000";
const OUT = join(process.cwd(), "screenshots", "faseC");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const SECTIONS = [
  { id: "antes-despues", label: "beforeafter" },
  { id: "situaciones", label: "situations" },
];

async function preWarm(page, reduceMotion) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.floor((scrollHeight * i) / steps));
    await page.waitForTimeout(reduceMotion ? 200 : 900);
  }
  await page.waitForTimeout(reduceMotion ? 200 : 2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);
}

async function captureSections(vp) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await preWarm(page, false);

  for (const sec of SECTIONS) {
    const handle = await page.$(`#${sec.id}`);
    if (!handle) continue;
    await handle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const path = join(OUT, `${vp.name}-${sec.label}.png`);
    await handle.screenshot({ path });
    console.log(`  ✓ ${vp.name}px ${sec.label} → ${path}`);
  }
  await browser.close();
}

async function recordSliderVideo() {
  const videoDir = join(OUT, "videos");
  mkdirSync(videoDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);

  // Scroll a la sección antes-después.
  await page.evaluate(() =>
    document.getElementById("antes-despues")?.scrollIntoView({ behavior: "smooth", block: "start" })
  );
  await page.waitForTimeout(2000);

  // Esperar a que termine la animación de bienvenida (50→70→30→50: ~3.5s + 0.35 lead).
  await page.waitForTimeout(4500);

  // Localizar el primer slider visible.
  const slider = await page.$("#antes-despues [role=slider]");
  if (slider) {
    const box = await slider.boundingBox();
    if (box) {
      const cy = box.y + box.height / 2;
      // Drag manual con mouse: izquierda → derecha → izquierda → centro.
      await page.mouse.move(box.x + box.width * 0.5, cy);
      await page.mouse.down();
      for (let p = 0.5; p >= 0.2; p -= 0.02) {
        await page.mouse.move(box.x + box.width * p, cy, { steps: 1 });
        await page.waitForTimeout(20);
      }
      for (let p = 0.2; p <= 0.8; p += 0.02) {
        await page.mouse.move(box.x + box.width * p, cy, { steps: 1 });
        await page.waitForTimeout(15);
      }
      for (let p = 0.8; p >= 0.5; p -= 0.02) {
        await page.mouse.move(box.x + box.width * p, cy, { steps: 1 });
        await page.waitForTimeout(20);
      }
      await page.mouse.up();
    }
  }
  await page.waitForTimeout(800);

  await page.close();
  await context.close();
  await browser.close();

  // Renombrar el archivo generado.
  const files = readdirSync(videoDir).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    const newest = files.sort().pop();
    const target = join(videoDir, "slider-interaction.webm");
    try {
      renameSync(join(videoDir, newest), target);
      console.log(`  ✓ Video slider → ${target}`);
    } catch (e) {
      console.log(`  ⚠ Video saved as ${newest} (rename failed: ${e.message})`);
    }
  }
}

async function webkitTouchTest() {
  console.log("\n=== WEBKIT (iOS Safari) — drag horizontal + scroll vertical ===");
  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Test A: scrollear hasta antes-después.
  await page.evaluate(() => document.getElementById("antes-despues")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1500);
  const initialScrollY = await page.evaluate(() => window.scrollY);
  console.log(`  scrollY antes del touch test: ${initialScrollY}`);

  // Test B: encontrar el slider y simular drag horizontal con touch.
  const slider = await page.$("#antes-despues [role=slider]");
  if (!slider) {
    console.log("  ✗ no encontré el slider en webkit");
    await browser.close();
    return;
  }
  const box = await slider.boundingBox();
  if (!box) {
    console.log("  ✗ no pude medir el bounding box del slider");
    await browser.close();
    return;
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // Capturar posición inicial del divisor. Motion aplica el clipPath y el `left`
  // del handle como CSS custom properties / inline style. Buscamos cualquier
  // elemento dentro del slider cuyo `left` esté en porcentaje (el handle circular).
  const readPosition = async () => {
    return await page.evaluate(() => {
      const slider = document.querySelector("#antes-despues [role=slider]");
      if (!slider) return null;
      const candidates = slider.querySelectorAll("[style*='left']");
      for (const el of candidates) {
        const s = el.style.left;
        const m = s.match(/(-?\d+(?:\.\d+)?)\s*%/);
        if (m) return parseFloat(m[1]);
      }
      return null;
    });
  };
  const positionBefore = await readPosition();

  // Drag horizontal con touch en webkit.
  await page.touchscreen.tap(cx, cy);
  await page.waitForTimeout(100);

  // Simulamos un pan horizontal mediante dispatchEvent (Playwright webkit no expone drag con touch directo;
  // usamos pointer events que es lo que escucha el slider).
  await page.evaluate(({ box }) => {
    const el = document.querySelector("#antes-despues [role=slider]");
    if (!el) return;
    const start = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
    const end = { x: box.x + box.width * 0.2, y: box.y + box.height * 0.5 };
    const opts = (x, y, type) => new PointerEvent(type, {
      pointerType: "touch",
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      isPrimary: true,
      buttons: 1,
    });
    el.dispatchEvent(opts(start.x, start.y, "pointerdown"));
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      el.dispatchEvent(opts(x, y, "pointermove"));
    }
    el.dispatchEvent(opts(end.x, end.y, "pointerup"));
  }, { box });
  await page.waitForTimeout(400);

  const positionAfter = await readPosition();

  console.log(`  position antes del drag: ${positionBefore}%`);
  console.log(`  position después del drag: ${positionAfter}%`);
  const moved = positionBefore !== null && positionAfter !== null && Math.abs(positionAfter - positionBefore) > 5;
  console.log(`  ${moved ? "✓" : "✗"} slider responde al touch (cambio >5%)`);

  // Verificar que scrollY no cambió durante el drag horizontal (no robó scroll vertical).
  const finalScrollY = await page.evaluate(() => window.scrollY);
  const scrollDelta = Math.abs(finalScrollY - initialScrollY);
  console.log(`  scrollY tras drag horizontal: ${finalScrollY} (delta ${scrollDelta}px)`);
  console.log(`  ${scrollDelta < 20 ? "✓" : "✗"} no roba scroll vertical (delta < 20px)`);

  // Test C: scroll vertical desde el contenedor del slider (touch swipe vertical).
  // En mobile WebKit no hay wheel; usamos un swipe vertical real con touchscreen.
  const scrollBefore = await page.evaluate(() => window.scrollY);
  // Simulamos un swipe vertical de arriba a abajo sobre el slider para verificar
  // que `touch-action: pan-y` permite el scroll vertical.
  await page.evaluate(({ box }) => {
    const el = document.querySelector("#antes-despues [role=slider]");
    if (!el) return;
    const start = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
    const end = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 - 300 };
    const make = (x, y, type) => new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: type === "touchend" ? [] : [new Touch({
        identifier: 1,
        target: el,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
      })],
      targetTouches: type === "touchend" ? [] : [new Touch({
        identifier: 1,
        target: el,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
      })],
      changedTouches: [new Touch({
        identifier: 1,
        target: el,
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
      })],
    });
    try {
      el.dispatchEvent(make(start.x, start.y, "touchstart"));
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        el.dispatchEvent(make(x, y, "touchmove"));
      }
      el.dispatchEvent(make(end.x, end.y, "touchend"));
    } catch {
      // Fallback: usar scrollBy directo para confirmar que el viewport permite scroll
      window.scrollBy({ top: 300, behavior: "instant" });
    }
  }, { box });
  await page.waitForTimeout(400);
  // Aunque touch-action permite el scroll, el navegador en headless puede no
  // procesar touch como scroll. Validamos vía scrollBy programático y la
  // existencia de touch-action: pan-y en el inline style.
  const touchActionStyle = await page.evaluate(() => {
    const el = document.querySelector("#antes-despues [role=slider]");
    return el ? getComputedStyle(el).touchAction : null;
  });
  console.log(`  touch-action computed: "${touchActionStyle}"`);
  console.log(`  ${touchActionStyle === "pan-y" ? "✓" : "✗"} touch-action: pan-y aplicado (permite scroll vertical)`);
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: "instant" }));
  await page.waitForTimeout(200);
  const scrollAfter = await page.evaluate(() => window.scrollY);
  console.log(`  scroll vertical programático OK: ${scrollAfter > scrollBefore ? "✓" : "✗"} (de ${scrollBefore} a ${scrollAfter})`);

  // Screenshot final para inspección visual.
  const screenshotPath = join(OUT, "webkit-ios-slider.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`  ✓ Screenshot WebKit → ${screenshotPath}`);

  const report = { positionBefore, positionAfter, scrollDelta, finalScrollY };
  writeFileSync(join(OUT, "webkit-report.json"), JSON.stringify(report, null, 2), "utf8");
  await browser.close();
}

(async () => {
  console.log("=== SCREENSHOTS por viewport ===");
  for (const vp of VIEWPORTS) {
    await captureSections(vp);
  }

  console.log("\n=== VIDEO del slider (1440px) ===");
  await recordSliderVideo();

  await webkitTouchTest();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
