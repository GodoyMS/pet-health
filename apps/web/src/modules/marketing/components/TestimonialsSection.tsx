import { Icon } from "@repo/ui";

import { TESTIMONIALS } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function TestimonialsSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="stories"
      className={`${className} scroll-mt-24 bg-[var(--landing-mist)]/80 py-20 sm:py-24`}
      aria-labelledby="stories-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-teal)]">
            Social proof
          </p>
          <h2
            id="stories-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            Loved by pet parents who want less guesswork
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="landing-quote rounded-2xl p-6 sm:p-7">
              <div className="mb-4 flex items-center gap-1 text-[var(--landing-coral)]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" variant="filled" className="text-base" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-[var(--landing-ink)] sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--landing-mint)] text-[var(--landing-teal-deep)]">
                  <Icon name={t.icon} variant="filled" className="text-lg" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--landing-ink)]">{t.name}</p>
                  <p className="text-xs text-[var(--landing-muted)]">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl">
          <img
            src="/landing/neighbourhood.jpg"
            alt="Happy dogs playing together in a sunny neighbourhood park"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="aspect-[21/9] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
