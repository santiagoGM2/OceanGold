import { ImageResponse } from "next/og";
import { BUSINESS, COPY } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${BUSINESS.name} — ${BUSINESS.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Carga una fuente desde Google Fonts en edge runtime. Devuelve ArrayBuffer
 * o null si la red falla (caemos a serif del sistema sin romper la imagen).
 *
 * Pasa `&text=...` para subset — el binario que descargamos sólo trae los
 * glifos que vamos a renderear (más rápido + más liviano).
 */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}` +
      `:wght@${weight}&text=${encodeURIComponent(text)}`;
    // UA explícita: Google sirve TTF si la UA es vieja; necesitamos TTF para
    // satori (el motor de next/og). Con UA moderna sirve woff2, que satori
    // ya soporta a partir de la versión que envuelve Next 16.
    const css = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    }).then((r) => r.text());
    const match = css.match(/src:\s*url\((https?:\/\/[^)]+?)\)\s*format\('(?:opentype|truetype|woff2?)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  // Texto completo que aparece en la imagen — Google subset el font binario.
  const renderedText =
    `${BUSINESS.name} ${BUSINESS.location} ${COPY.hero.title} ` +
    `${COPY.hero.subtitle} El renacimiento de tu joya ` +
    `${BUSINESS.yearsOfCraft} años + ${BUSINESS.storiesRecovered.toLocaleString("es")} ` +
    `historias ${BUSINESS.averageRating} ★`;

  const [cinzelData, italianaData] = await Promise.all([
    loadGoogleFont("Cinzel", 400, renderedText),
    loadGoogleFont("Italiana", 400, BUSINESS.name),
  ]);

  // Fonts array dinámico — sólo agregamos las que cargaron correctamente.
  type FontEntry = {
    name: string;
    data: ArrayBuffer;
    weight: 400;
    style: "normal";
  };
  const fonts: FontEntry[] = [];
  if (cinzelData)
    fonts.push({ name: "Cinzel", data: cinzelData, weight: 400, style: "normal" });
  if (italianaData)
    fonts.push({ name: "Italiana", data: italianaData, weight: 400, style: "normal" });

  // Si una falla, fallback a serif del sistema (mejor que romper la imagen).
  const serifFamily = cinzelData ? "Cinzel" : "serif";
  const wordmarkFamily = italianaData ? "Italiana" : serifFamily;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 90px",
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(14% 0.022 158), oklch(6.5% 0.018 158))",
          color: "#f0ece4",
          fontFamily: serifFamily,
        }}
      >
        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontSize: 38,
              letterSpacing: "0.02em",
              color: "#e8dfc8",
              fontWeight: 400,
              fontFamily: wordmarkFamily,
              lineHeight: 1,
            }}
          >
            {BUSINESS.name}
          </div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#c9a84c",
              fontWeight: 400,
            }}
          >
            {BUSINESS.location}
          </div>
        </div>

        {/* Center */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#c9a84c",
              marginBottom: 30,
              fontWeight: 400,
            }}
          >
            El renacimiento de tu joya
          </div>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 400,
              color: "#f0ece4",
              letterSpacing: "-0.015em",
              fontFamily: serifFamily,
            }}
          >
            {COPY.hero.title}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(201,168,76,0.35)",
            paddingTop: 30,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#e8dfc8",
              fontWeight: 400,
              letterSpacing: "0.02em",
              fontStyle: "italic",
              maxWidth: 650,
              lineHeight: 1.4,
            }}
          >
            {COPY.hero.subtitle}
          </div>
          <div
            style={{
              display: "flex",
              gap: 40,
              fontSize: 16,
              color: "#c9a84c",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 400,
            }}
          >
            <span>{BUSINESS.yearsOfCraft} años</span>
            <span>+{BUSINESS.storiesRecovered.toLocaleString("es")} historias</span>
            <span>{BUSINESS.averageRating} ★</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
