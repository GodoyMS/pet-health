import { Icon } from "@repo/ui";

import { STEPS } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function HowItWorksSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id="how-it-works"
      className={`${className} scroll-mt-24 bg-white/60 py-20 sm:py-24`}
      aria-labelledby="how-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--landing-teal)]">
            How it works
          </p>
          <h2
            id="how-title"
            className="font-display mt-3 text-3xl font-bold tracking-tight text-[var(--landing-ink)] sm:text-4xl"
          >
            Three steps from chaos to calm
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            className="landing-step-line absolute left-[1.4rem] top-4 hidden h-[calc(100%-2rem)] w-px md:left-0 md:top-8 md:block md:h-px md:w-full"
            aria-hidden="true"
          />
          {STEPS.map((step) => (
            <li key={step.step} className="relative">
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--landing-teal)] font-display text-sm font-bold text-white shadow-md">
                  {step.step}
                </span>
                <div className="md:mt-6">
                  <div className="mb-3 inline-flex text-[var(--landing-teal-deep)]">
                    <Icon name={step.icon} variant="filled" className="text-2xl" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[var(--landing-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--landing-muted)] sm:text-base">
                    {step.body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
