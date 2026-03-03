import { cva } from "../../../lib/class-variance-authority";

const comboboxInputGroupVariants = cva("w-auto", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const comboboxContentVariants = cva(
  "bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 overflow-hidden rounded-lg shadow-md ring-1 duration-100 group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none",
  {
    variants: {
      variant: {
        default: "",
        outline: "border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const comboboxListVariants = cva(
  "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 p-1 data-empty:p-0 overflow-y-auto overscroll-contain"
);

const comboboxItemVariants = cva(
  "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        destructive: "data-highlighted:bg-destructive/10 data-highlighted:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const comboboxChipsVariants = cva(
  "border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 has-aria-invalid:border-destructive flex min-h-8 flex-wrap items-center gap-1 rounded-lg border bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:ring-2 has-aria-invalid:ring-2 has-data-[slot=combobox-chip]:px-1"
);

const comboboxChipVariants = cva(
  "bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50"
);

export {
  comboboxInputGroupVariants,
  comboboxContentVariants,
  comboboxListVariants,
  comboboxItemVariants,
  comboboxChipsVariants,
  comboboxChipVariants,
};
