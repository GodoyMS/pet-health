"use client";

import { Toaster as SonnerToaster } from "sonner";
import { cn } from "../../../lib/utils/cn";

const toastClassNames = {
  toast: cn(
    "group toast rounded-lg border bg-card text-card-foreground shadow-lg",
    "border-border px-4 py-3 gap-3 font-sans text-sm",
    "[&[data-type=success]]:border-l-4 [&[data-type=success]]:border-l-success",
    "[&[data-type=error]]:border-l-4 [&[data-type=error]]:border-l-destructive",
    "[&[data-type=warning]]:border-l-4 [&[data-type=warning]]:border-l-warning",
    "[&[data-type=info]]:border-l-4 [&[data-type=info]]:border-l-info",
  ),
  title: "font-semibold text-foreground",
  description: "text-muted-foreground mt-0.5",
  actionButton: cn(
    "inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground",
    "hover:bg-primary/90 transition-colors",
  ),
  cancelButton: cn(
    "inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium",
    "hover:bg-accent hover:text-accent-foreground transition-colors",
  ),
  closeButton: cn(
    "rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ),
};

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-right"
      offset={24}
      gap={12}
      closeButton
      richColors={false}
      toastOptions={{
        classNames: toastClassNames,
        unstyled: false,
      }}
    />
  );
}

export { toast } from "sonner";
