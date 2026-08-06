import { Link } from "react-router-dom";

import { Button, Icon } from "@repo/ui";

export function HeroSection() {
  return (
    <section id="landing-hero" className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-hero__media" aria-hidden="true">
        <img
          src="/landing/hero-pets.jpg"
          alt=""
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
        <div className="landing-hero__veil" />
      </div>

      <div className="landing-hero__content mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:justify-center lg:px-8 lg:pb-24 lg:pt-24">
        <div className="max-w-xl landing-stagger">
          <p className="landing-reveal is-visible mb-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Pet Health
          </p>
          <h1
            id="landing-hero-title"
            className="landing-reveal is-visible font-display text-2xl font-semibold leading-snug tracking-tight text-white/95 sm:text-3xl md:text-4xl"
          >
            The calm co-pilot for every wag, purr, and checkup.
          </h1>
          <p className="landing-reveal is-visible mt-4 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
            Track wellness, never miss preventive care, and turn everyday notes into clarity your vet can use.
          </p>
          <div className="landing-reveal is-visible mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="xl"
              className="landing-cta-primary h-12 cursor-pointer border-0 px-7 text-base"
            >
              <Link to="/register">
                Start tracking free
                <Icon name="arrow_back" className="ml-1 rotate-180 text-lg" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="h-12 cursor-pointer border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <a href="#demo">Watch the demo</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
