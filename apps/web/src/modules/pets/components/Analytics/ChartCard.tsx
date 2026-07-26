import type { ReactNode } from "react";

export function ChartCard({
  title: titleText,
  description,
  children,
  footer
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {titleText}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      {footer ? (
        <div className="mt-4 border-t border-border/40 pt-4">{footer}</div>
      ) : null}
    </section>
  );
}
