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

        <footer className="relative px-6 md:px-14 py-10 border-t border-border-subtle">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span
              className="text-champagne font-normal tracking-[0.02em] text-[1.2rem] leading-none"
              style={{ fontFamily: "var(--font-wordmark)" }}
            >
              {BUSINESS.name}
            </span>
            <span className="text-xs text-text-muted text-center md:text-right">
              {BUSINESS.address.street} · {BUSINESS.address.neighborhood},{" "}
              {BUSINESS.address.region} · © {new Date().getFullYear()}{" "}
              <span
                className="text-champagne"
                style={{ fontFamily: "var(--font-wordmark)", fontSize: "0.95rem" }}
              >
                {BUSINESS.name}
              </span>
            </span>
          </div>
        </footer>
      </main>
    </LeadFormProvider>
  );
}
