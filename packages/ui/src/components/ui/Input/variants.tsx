import { cva } from "../../../lib/class-variance-authority";
import { cn } from "../../../lib/utils/cn";

export const inputVariants = cva(
  cn(


    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    " h-9 w-full min-w-0 rounded-md  border border-input px-3 py-1 shadow-xs outline-none",
    "file:inline-flex file:h-7 file:border-0 file:text-sm file:font-medium",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-sm ",
    "border border-input",
    "focus:bg-transparent",
  ),  
  {
    variants: {

      iconPosition: {
        right: "pr-10",
        left: "pl-10",
        "": "",
      },
    },
    defaultVariants: {
      iconPosition: "",
    },
  }
);