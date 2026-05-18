"use client";

import dynamic from "next/dynamic";

function TestimonialsSkeleton() {
  return (
    <section
      id="testimonios"
      className="relative px-6 md:px-14 py-20 md:py-32"
      aria-hidden="true"
    >
      <div className="max-w-7xl">
        <div className="h-3 w-32 bg-accent-gold/30 mb-5" />
        <div className="h-12 md:h-16 w-full max-w-2xl bg-surface-1/80 mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-subtle/40 border-y border-border-subtle">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-1/70 px-8 py-10 min-h-[300px]" />
          ))}
        </div>
      </div>
    </section>
  );
}

const Testimonials = dynamic(
  () => import("./Testimonials").then((m) => ({ default: m.Testimonials })),
  {
    loading: TestimonialsSkeleton,
  }
);

export default Testimonials;
