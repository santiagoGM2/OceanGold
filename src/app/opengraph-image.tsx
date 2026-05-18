import { ImageResponse } from "next/og";
import { BUSINESS, COPY } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${BUSINESS.name} — ${BUSINESS.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          fontFamily: "serif",
        }}
      >
        {/* Top */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#e8dfc8",
              fontWeight: 400,
            }}
          >
            {BUSINESS.name}
          </div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#c9a84c",
              fontWeight: 300,
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
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "#c9a84c",
              marginBottom: 30,
              fontWeight: 300,
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
              letterSpacing: "0.01em",
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
            borderTop: "1px solid rgba(201,168,76,0.3)",
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
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 300,
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
    }
  );
}
