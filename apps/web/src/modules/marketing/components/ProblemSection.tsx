import { Icon } from "@repo/ui";

import { PROBLEM_POINTS } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function ProblemSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="problem"
      className={`${className} scroll-mt-24 py-20 sm:py-24`}
      aria-labelledby="problem-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-teal)]">
            The gap
          </p>
          <h2
            id="problem-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            Love is constant. Pet records usually aren&apos;t.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
            Most owners care deeply — and still lose track between visits. Pet Health closes that gap
            with one calm place for every signal that matters.
          </p>
        </div>

        <div className="landing-stagger mt-12 grid gap-10 md:grid-cols-3">
          {PROBLEM_POINTS.map((point) => (
            <article key={point.title} className="landing-reveal is-visible">
              <div className="landing-feature-icon">
                <Icon name={point.icon} className="text-2xl" variant="filled" />
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-[var(--landing-ink)]">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)] sm:text-base">
                {point.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
