/**
 * Builders de JSON-LD (Schema.org) para SEO.
 * Se inyectan en layout.tsx y page.tsx con <script type="application/ld+json">.
 */
import {
  BUSINESS,
  SERVICES,
  SITE_URL,
  TESTIMONIALS,
  type ServiceId,
} from "./constants";

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS.address.street,
  addressLocality: BUSINESS.address.city,
  addressRegion: BUSINESS.address.region,
  addressCountry: BUSINESS.address.country,
} as const;

const OPENING_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: BUSINESS.hours.open,
    closes: BUSINESS.hours.close,
  },
] as const;

export function jewelryStoreSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${SITE_URL}#business`,
    name: BUSINESS.name,
    description:
      "Reparación, transformación y personalización de joyas de autor en Downtown Miami. Especialistas en joyería cubana y latina de 10K y 14K. Diagnóstico gratuito virtual o presencial.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    address: ADDRESS,
    openingHoursSpecification: OPENING_HOURS,
    foundingDate: `${new Date().getFullYear() - BUSINESS.yearsOfCraft}`,
    priceRange: "$$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.averageRating,
      reviewCount: BUSINESS.storiesRecovered,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

export function servicesSchema() {
  return SERVICES.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}#service-${s.id}`,
    name: s.name,
    description: s.desc,
    provider: { "@id": `${SITE_URL}#business` },
    areaServed: ADDRESS,
    serviceType: s.tagline,
  }));
}

export function reviewsSchema() {
  return TESTIMONIALS.map((t) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@id": `${SITE_URL}#business` },
    author: { "@type": "Person", name: t.name },
    reviewBody: t.quote,
    reviewRating: {
      "@type": "Rating",
      ratingValue: 5,
      bestRating: 5,
    },
  }));
}

export type ServiceSchemaId = ServiceId;
