import { Link } from "react-router-dom";

import { Button, Icon } from "@repo/ui";

import { useReveal } from "../hooks/useReveal";

export function FinalCtaSection() {
  const { ref, className } = useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`${className} px-4 py-20 sm:px-6 sm:py-24 lg:px-8`}
      aria-labelledby="final-cta-title"
    >
      <div className="landing-final-cta mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-16">
        <div className="landing-float mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
          <Icon name="pets" variant="filled" className="text-3xl" aria-label="Pet Health" />
        </div>
        <h2
          id="final-cta-title"
          className="font-display mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Give your pet a healthier tomorrow — starting tonight.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
          Create a free account, add your first pet, and feel the calm of care that finally stays organized.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="xl"
            className="landing-cta-primary h-12 cursor-pointer border-0 px-8 text-base"
          >
            <Link to="/register">Create free account</Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="h-12 cursor-pointer border-white/35 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
