import React from "react";

import { Icon } from "@repo/ui";

type AiReportSectionProps = {
  icon: string;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "highlight";
};

export function AiReportSection({
  icon,
  title,
  children,
  variant = "default"
}: AiReportSectionProps) {
  return (
    <section
      className={`rounded-xl border p-6 shadow-sm ${
        variant === "highlight"
          ? "border-primary/25 bg-linear-to-br from-primary/5 via-card to-card"
          : "border-border/50 bg-card"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
            variant === "highlight"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon name={icon} className="size-5" aria-hidden />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

type AiReportProseProps = {
  text: string;
};

export function AiReportProse({ text }: AiReportProseProps) {
  return (
    <p className="whitespace-pre-line leading-relaxed text-foreground/90">
      {text}
    </p>
  );
}

type AiReportListProps = {
  items: string[];
  ordered?: boolean;
  icon?: string;
};

export function AiReportList({ items, ordered = false, icon }: AiReportListProps) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={`space-y-2.5 ${ordered ? "list-none counter-reset-[step]" : ""}`}
    >
      {items.map((item, index) => (
        <li
          key={`${index}-${item.slice(0, 24)}`}
          className={`flex gap-3 ${ordered ? "counter-increment-[step]" : ""}`}
        >
          {ordered ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
          ) : icon ? (
            <Icon
              name={icon}
              className="mt-0.5 size-4 shrink-0 text-primary/70"
              aria-hidden
            />
          ) : (
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
          )}
          <span className="flex-1 leading-relaxed">{item}</span>
        </li>
      ))}
    </Tag>
  );
}
