import { Link } from "react-router-dom";

import { Icon } from "@repo/ui";

import { NAV_LINKS } from "../data/content";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-white/80 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon name="pets" variant="filled" className="text-xl" />
            </span>
            <span className="font-display text-lg font-semibold text-[var(--landing-ink)]">
              Pet Health
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--landing-muted)]">
            The wellness co-pilot for modern pet parents — health logs, preventive care, AI clarity,
            and community in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="cursor-pointer text-sm text-[var(--landing-ink)] transition-colors hover:text-[var(--landing-teal)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
              Account
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/login"
                  className="cursor-pointer text-sm text-[var(--landing-ink)] transition-colors hover:text-[var(--landing-teal)]"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="cursor-pointer text-sm text-[var(--landing-ink)] transition-colors hover:text-[var(--landing-teal)]"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--landing-muted)]">
              Care
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--landing-muted)]">
              <li className="inline-flex items-center gap-2">
                <Icon name="health_and_safety" className="text-base text-[var(--landing-teal)]" />
                Wellness first
              </li>
              <li className="inline-flex items-center gap-2">
                <Icon name="shield_person" className="text-base text-[var(--landing-teal)]" />
                Privacy minded
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-4 text-xs text-[var(--landing-muted)] sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Pet Health. Built for pets — and the people who love them.
      </div>
    </footer>
  );
}
