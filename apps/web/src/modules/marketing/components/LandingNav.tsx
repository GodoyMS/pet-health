import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button, Icon } from "@repo/ui";

import { NAV_LINKS } from "../data/content";

export function LandingNav() {
  const [overHero, setOverHero] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    if (!hero) {
      setOverHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Still "on hero" while any meaningful slice of it remains under the nav.
        setOverHero(Boolean(entry?.isIntersecting));
      },
      {
        // Shrink the observed viewport by the nav height so we flip as soon as
        // the hero leaves the area beneath the bar.
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // When the mobile sheet is open over the hero, force the solid bar for readability.
  const solid = !overHero || open;

  return (
    <header
      className={`landing-nav fixed inset-x-0 top-0 z-50 ${solid ? "is-solid" : "is-over-hero"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="landing-nav__brand flex items-center gap-2.5 cursor-pointer">
          <span className="landing-nav__mark flex h-9 w-9 items-center justify-center rounded-xl">
            <Icon name="pets" variant="filled" className="text-xl" aria-label="Pet Health" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Pet Health
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="landing-nav__link cursor-pointer text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="landing-nav__ghost cursor-pointer"
          >
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="landing-cta-primary cursor-pointer border-0">
            <Link to="/register">Start free</Link>
          </Button>
        </div>

        <button
          type="button"
          className="landing-nav__menu inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "view_agenda"} className="text-2xl" />
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-white/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="cursor-pointer rounded-lg px-3 py-3 text-sm font-medium text-[var(--landing-ink)] hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button asChild variant="outline" className="cursor-pointer">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="landing-cta-primary cursor-pointer border-0">
                <Link to="/register" onClick={() => setOpen(false)}>
                  Start free
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
