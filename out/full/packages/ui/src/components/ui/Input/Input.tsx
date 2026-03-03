import * as React from "react";
import {  type VariantProps } from "../../../lib/class-variance-authority";

import { Label } from "../Label/Label";
import { cn } from "../../../lib/utils/cn";
import { inputVariants } from "./variants";



function Input({
  className,
  type = "text",
  title,
  iconLeft,
  iconRight,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    title?: string;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
  }) {
  const hasIcon = Boolean(iconLeft || iconRight);
  return (
    <div className="grid w-full items-center gap-3">
      {title && (
        <Label
          htmlFor={props.id}
          
        >
          {title}
        </Label>
      )}

      <div className={"relative "}>
        {iconLeft && (
          <div className=" absolute left-3 top-1/2 flex flex-col justify-center -translate-y-1/2">
            {iconLeft}{" "}
          </div>
        )}
        {iconRight && (
          <div className=" absolute right-3 top-1/2 flex flex-col justify-center -translate-y-1/2">
            {iconRight}{" "}
          </div>
        )}
        <input
          id={props.id}
          type={type}
          data-slot="input"
          placeholder={props.placeholder ?? " "}
          className={cn(
            inputVariants({
              className,
              iconPosition: hasIcon
                ? iconLeft
                  ? "left"
                  : iconRight
                  ? "right"
                  : ""
                : "",
            })
          )}
          {...props}
        />
      </div>
    </div>
  );
}

export  {Input};