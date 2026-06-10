import type { Metadata, Viewport } from "next";
import { Cinzel, Italiana, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BUSINESS, COPY, SITE_URL } from "@/lib/constants";
import {
  jewelryStoreSchema,
  servicesSchema,
  reviewsSchema,
} from "@/lib/schema";
import { AnimatedBackdrop } from "@/components/ui/AnimatedBackdrop";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Italiana — fuente fashion/luxury jewelry diseñada para alto contraste y
// elegancia editorial. Reservada para el wordmark "DuJoyero" en el Hero
// header, footer y Authority h2. Su geometría delgada con remates altos
// evoca joyería de autor y prestigio.
const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0d1410",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    template: `%s · ${BUSINESS.name}`,
  },
  description:
    "Reparación, transformación y personalización de joyas de autor en Miami, FL. Diagnóstico gratuito virtual o presencial. 23 años de oficio artesanal.",
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.name }],
  keywords: [
    "joyería Miami",
    "reparación de joyas",
    "transformación de oro",
    "joyería de autor",
    "diseño de joyas personalizado",
    "DuJoyero",
    "Miami FL",
  ],
  openGraph: {
    type: "website",
    locale: "es_US",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description: COPY.hero.subtitle,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${BUSINESS.name} — ${BUSINESS.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description: COPY.hero.subtitle,
    images: ["/og-image.jpg"],
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ldJson = [
    jewelryStoreSchema(),
    ...servicesSchema(),
    ...reviewsSchema(),
  ];

  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${italiana.variable} ${jost.variable} antialiased`}
    >
      <head>
        {/* El poster ya no es candidato LCP del Hero (Fase F.5.1 removió el
            video del Hero). El poster ahora vive en la nueva sección
            "El regalo perfecto", below-the-fold — sin preload. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body className="min-h-screen bg-surface-0 text-text-default font-sans">
        <AnimatedBackdrop />
        <div className="relative z-[1]">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
