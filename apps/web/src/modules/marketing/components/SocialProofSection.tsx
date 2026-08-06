import { SOCIAL_PROOF, STATS } from "../data/content";
import { useReveal } from "../hooks/useReveal";

export function SocialProofSection() {
  const { ref, className } = useReveal<HTMLElement>();
  const loop = [...SOCIAL_PROOF, ...SOCIAL_PROOF];

  return (
    <section ref={ref} className={`${className} border-b border-border/60 bg-white/70 py-10`} aria-label="Highlights">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-[var(--landing-teal-deep)] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--landing-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-marquee mt-10" aria-hidden="true">
        <div className="landing-marquee__track">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-[var(--landing-muted)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-teal)]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
