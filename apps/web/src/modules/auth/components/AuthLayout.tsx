import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Icon } from "@repo/ui";

import "../styles/auth.css";

type AuthLayoutProps = {
  title: string;
  lead: string;
  panelHeadline: string;
  panelSub: string;
  panelImage: string;
  panelImageAlt: string;
  benefits: readonly string[];
  switchLabel: string;
  switchTo: string;
  switchHref: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  lead,
  panelHeadline,
  panelSub,
  panelImage,
  panelImageAlt,
  benefits,
  switchLabel,
  switchTo,
  switchHref,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to form
      </a>

      <div className="auth-shell">
        <aside className="auth-panel">
          <div className="auth-panel__media">
            <img
              src={panelImage}
              alt={panelImageAlt}
              width={1200}
              height={1600}
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="auth-panel__scrim" aria-hidden="true" />
          <div className="auth-panel__content">
            <Link to="/" className="auth-panel__brand cursor-pointer">
              <span className="auth-panel__mark">
                <Icon name="pets" variant="filled" className="text-xl text-white" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">
                Pet Health
              </span>
            </Link>
            <p className="auth-panel__headline">{panelHeadline}</p>
            <p className="auth-panel__sub">{panelSub}</p>
            <ul className="auth-panel__benefits">
              {benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="auth-form">
          <header className="auth-form__top">
            <Link to="/" className="auth-form__brand cursor-pointer">
              <span className="auth-form__mark">
                <Icon name="pets" variant="filled" className="text-lg" />
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                Pet Health
              </span>
            </Link>
            <p className="auth-form__switch">
              {switchLabel}{" "}
              <Link to={switchHref} className="cursor-pointer">
                {switchTo}
              </Link>
            </p>
          </header>

          <div className="auth-form__body">
            <div id="auth-main" className="auth-form__inner">
              <h1 className="auth-form__title">{title}</h1>
              <p className="auth-form__lead">{lead}</p>
              <div className="mt-8">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
