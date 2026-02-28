import React from "react";
export type IconVariant = "filled" | "outline"

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The name of the Material Symbol (e.g. "home", "search") */
  name: string;
  /** Variant style, defaults to "filled" */
  variant?: IconVariant;
  /** Fill toggle: 0 = outline, 1 = filled (default: 1) */
  fill?: 0 | 1;
  /** Weight from 100 to 700 (default: 400) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Grade -25 to 200 (default: 0) */
  grade?: -25 | 0 | 200;
  /** Optical size (default: 24) */
  opticalSize?: 20 | 24 | 40 | 48;
  /** Extra Tailwind or custom classes */
  className?: string;
  /** Accessible label (if not provided, aria-hidden is true) */
  "aria-label"?: string;
}


 const Icon: React.FC<IconProps> = ({
  name,
  variant = "outline",
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className,
  "aria-label": ariaLabel,
  ...props
}) => {
  

  return (
    <span
      className={className}
      style={{
        fontFamily: 'Material Symbols Outlined',
        fontVariationSettings: ` "FILL" ${variant==="filled"? `1`:`0`}, "wght" ${weight}, "GRAD" ${grade}, "opsz" ${opticalSize}`,
      }}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      {...props}
    >
      {name}
    </span>
  );
};
export {Icon,type IconProps as IconPropsType}