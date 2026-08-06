import { Icon } from "@repo/ui";

import { FEATURES } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function FeaturesSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="features"
      className={`${className} scroll-mt-24 bg-[var(--landing-mist)]/70 py-20 sm:py-24`}
      aria-labelledby="features-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-teal)]">
            Platform
          </p>
          <h2
            id="features-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            Everything your pet&apos;s care circle needs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
            From daily check-ins to AI-ready summaries — built as one product, not a pile of apps.
          </p>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="group">
              <div className="landing-feature-icon transition-transform duration-200 group-hover:-translate-y-0.5">
                <Icon name={feature.icon} className="text-2xl" variant="filled" />
              </div>
              <h3 className="font-display mt-5 text-lg font-semibold text-[var(--landing-ink)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/landing/care-moment.jpg"
              alt="Owner caring for a dog outdoors during a wellness check"
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover aspect-[4/3]"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-coral)]">
              Built for real life
            </p>
            <h3 className="font-display mt-3 text-2xl font-bold text-[var(--landing-ink)] sm:text-3xl">
              Small daily rituals. Big long-term clarity.
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)]">
              Log in under a minute. Over weeks, patterns emerge — appetite dips, weight drift,
              missed boosters — so you act early instead of reacting late.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Touch-friendly logging on the go",
                "Reminders that respect your calendar",
                "Insights that read like a story, not a spreadsheet",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[var(--landing-ink)]">
                  <Icon
                    name="check_circle"
                    variant="filled"
                    className="mt-0.5 text-lg text-[var(--landing-teal)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
