import { cva } from "../../../lib/class-variance-authority";

export const buttonVariants = cva(
  [
    "inline-flex disabled:opacity-50 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium duration-500 cursor-pointer transition-all",
    "disabled:pointer-events-none disabled:bg-blue/10  [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:border-ring  focus-visible:ring-[3px] aria-invalid:ring-error/20 aria-invalid:border-error",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary  hover:shadow-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground shadow-xs",
        secondary:
          "bg-secondary hover:shadow-secondary hover:shadow-xs active:bg-secondary/80 text-secondary-foreground ",
        outline: "border border-border bg-background hover:bg-accent text-foreground hover:text-accent-foreground",
        ghost:"hover:bg-accent hover:text-accent-foreground ",
        flat:"bg-primary/10 text-primary hover:bg-primary/20",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        link:"text-primary underline-offset-4 hover:underline",
      },
      size: {
            default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xl: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);