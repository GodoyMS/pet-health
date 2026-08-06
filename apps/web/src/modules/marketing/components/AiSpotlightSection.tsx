import { Link } from "react-router-dom";

import { Button, Icon } from "@repo/ui";

import { HIGHLIGHTS } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function AiSpotlightSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`${className} scroll-mt-24 py-20 sm:py-24`}
      aria-labelledby="ai-title"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="order-2 overflow-hidden rounded-2xl lg:order-1">
          <img
            src="/landing/clinic-care.jpg"
            alt="Veterinarian gently examining a calm cat"
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-coral)]">
            <Icon name="wand_stars" variant="filled" className="text-base" />
            AI clarity
          </p>
          <h2
            id="ai-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            Walk into every visit with a story that makes sense
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
            Pet Health summarizes your logs into awareness scores and readable reports — so you
            advocate for your pet with confidence, not fragmented memories.
          </p>

          <div className="mt-8 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="landing-feature-icon shrink-0">
                  <Icon name={item.icon} variant="filled" className="text-xl" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--landing-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--landing-muted)]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="landing-cta-primary mt-8 cursor-pointer border-0">
            <Link to="/register">Generate your first summary</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
