import { LandingTracker } from "@/components/sections/LandingTracker";
import { Hero } from "@/components/sections/Hero";
import BeforeAfter from "@/components/sections/BeforeAfterLazy";
import { Situations } from "@/components/sections/Situations";
import Testimonials from "@/components/sections/TestimonialsLazy";
import { GiftVideoSection } from "@/components/sections/GiftVideoSection";
import { Alert } from "@/components/sections/Alert";
import { Authority } from "@/components/sections/Authority";
import { LeadFormProvider } from "@/components/sections/LeadForm/leadFormContext";
import LeadForm from "@/components/sections/LeadForm/LeadFormLazy";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { FloatingButtons } from "@/components/ui/FloatingButtons";
import { BUSINESS } from "@/lib/constants";

export default function HomePage() {
  return (
    <LeadFormProvider>
      <ScrollProgress />
      <FloatingButtons />
      <main className="relative">
        <LandingTracker />

        <Hero />
        <BeforeAfter />
        <GiftVideoSection />
        <Situations />
        <Testimonials />
        <Alert />
        <LeadForm />
        <Authority />

        <footer className="relative px-6 md:px-14 py-12 border-t border-border-subtle">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-7xl mx-auto">
            <div>
              <span
                className="block text-champagne font-normal tracking-[0.02em] text-[1.35rem] leading-none mb-3"
                style={{ fontFamily: "var(--font-wordmark)" }}
              >
                {BUSINESS.name}
              </span>
              <span className="block text-[0.78rem] text-text-muted font-light leading-[1.65]">
                {BUSINESS.address.street}
                <br />
                {BUSINESS.address.neighborhood}, {BUSINESS.address.region}
              </span>
            </div>
            <span className="text-[0.7rem] text-text-muted/80 font-light tracking-[0.06em] md:text-right">
              © {new Date().getFullYear()}{" "}
              <span
                className="text-champagne"
                style={{ fontFamily: "var(--font-wordmark)", fontSize: "0.85rem" }}
              >
                {BUSINESS.name}
              </span>
              . Todos los derechos reservados.
            </span>
          </div>
        </footer>
      </main>
    </LeadFormProvider>
  );
}
