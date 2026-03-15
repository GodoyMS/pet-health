import { cva } from "../../../lib/class-variance-authority";

const selectTriggerVariants = cva(
  "border-input  data-placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive gap-1.5 rounded-sm border bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors select-none focus-visible:ring-2 aria-invalid:ring-2 flex w-full items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-border bg-transparent",
        filled: "border-transparent bg-muted hover:bg-muted/80",
        ghost: "border-transparent bg-transparent hover:bg-accent",
        destructive: "border-destructive/50 bg-destructive/5 text-destructive",
        success: "border-border bg-background text-foreground",
      },
      size: {
        sm: "h-7 rounded-md text-xs",
        md: "h-8 text-sm",
        lg: "h-9 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  },
);

const selectContentVariants = cva(
  "bg-popover text-popover-foreground data-[state=open]:animate-select-open data-[state=closed]:animate-select-close ring-foreground/10 relative z-50 max-h-96 min-w-36 overflow-hidden rounded-lg border border-border shadow-md ",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

const selectItemVariants = cva(
  "focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-sm py-1 pr-8 pl-1.5 text-sm relative flex w-full cursor-default select-none items-center outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      size: {
        sm: "py-1 text-xs",
        md: "py-1 text-sm",
        lg: "py-1.5 text-sm",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

export { selectTriggerVariants, selectContentVariants, selectItemVariants };
