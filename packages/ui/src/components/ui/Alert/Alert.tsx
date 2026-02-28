import * as React from "react"
import { cn } from "../../../lib/utils/cn"
import type { VariantProps } from "../../../lib/class-variance-authority"
import  { cva } from "../../../lib/class-variance-authority"
import { Icon } from "../Icon/Icon"
import { Button } from "../Button/Button"

const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:pb-2 data-[dismissible=true]:pr-12 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        "default-flat":"bg-secondary text-foreground border-border",
        destructive:
          "text-destructive bg-card border-destructive/20 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",
        success:
          "text-success-foreground bg-success border-success/20 [&>svg]:text-success-foreground *:data-[slot=alert-description]:text-success-foreground/90",
        "success-flat":
          "text-success bg-success/10 border-success/20 [&>svg]:text-success *:data-[slot=alert-description]:text-success/80",
        warning:
          "text-warning-foreground bg-warning border-warning/20 [&>svg]:text-warning-foreground *:data-[slot=alert-description]:text-warning-foreground/90",
        "warning-flat":
          "text-foreground bg-warning/10 border-warning/20 [&>svg]:text-warning *:data-[slot=alert-description]:text-warning/90",
        info:
          "text-info-foreground bg-info border-info/20 [&>svg]:text-info-foreground *:data-[slot=alert-description]:text-info-foreground/90",
        "info-flat":
          "text-info bg-info/10 border-info/20 [&>svg]:text-info *:data-[slot=alert-description]:text-info/90",
        error:
          "text-error-foreground bg-error border-error/20 [&>svg]:text-error-foreground *:data-[slot=alert-description]:text-error-foreground/90",
        "error-flat":
          "text-error bg-error/10 border-error/20 [&>svg]:text-error *:data-[slot=alert-description]:text-error/90",
      },
      size: {
        sm: "px-3 py-2 text-xs [&>svg]:size-3 [&>svg]:translate-y-0.5",
        md: "px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:translate-y-0.5",
        lg: "px-6 py-4 text-base [&>svg]:size-5 [&>svg]:translate-y-1",
      },
      elevation: {
        none: "",
        low: "shadow-sm",
        medium: "shadow-md",
        high: "shadow-lg",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      elevation: "none",
      rounded: "lg",
    },
  }
)


// Default icons for each variant
const variantIcons = {
  default: "info",
  "default-flat": "info",
  destructive: "error",
  success: "check_circle",
  "success-flat": "check_circle",
  warning: "warning",
  "warning-flat": "warning",
  info: "info",
  "info-flat": "info",
  error: "error",
  "error-flat": "error",
} as const

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean
  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void
  /**
   * Auto-hide timeout in milliseconds
   */
  autoHideDuration?: number
  /**
   * Icon to display, or true to use default icon for variant
   */
  icon?: React.ReactNode | boolean
  /**
   * Custom close button label for accessibility
   */
  closeLabel?: string
  /**
   * Whether to show animations
   */
  animated?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = "default",
    size = "md",
    elevation = "none",
    rounded = "lg",
    dismissible = false,
    onDismiss,
    autoHideDuration,
    icon,
    closeLabel = "Close alert",
    animated = true,
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false)
    const autoHideTimeoutRef = React.useRef<NodeJS.Timeout>(null)

    const handleDismiss = React.useCallback(() => {
      if (animated) {
        setIsAnimatingOut(true)
        // Wait for animation to complete before actually hiding
        setTimeout(() => {
          setIsVisible(false)
          onDismiss?.()
        }, 200) // Match transition duration
      } else {
        setIsVisible(false)
        onDismiss?.()
      }
    }, [animated, onDismiss])

    // Handle auto-hide functionality
    React.useEffect(() => {
      if (autoHideDuration && autoHideDuration > 0) {
        autoHideTimeoutRef.current = setTimeout(() => {
          handleDismiss()
        }, autoHideDuration)
      }

      return () => {
        if (autoHideTimeoutRef.current) {
          clearTimeout(autoHideTimeoutRef.current)
        }
      }
    }, [autoHideDuration, handleDismiss])

    // Clear timeout on unmount or when duration changes
    React.useEffect(() => {
      return () => {
        if (autoHideTimeoutRef.current) {
          clearTimeout(autoHideTimeoutRef.current)
        }
      }
    }, [])

    // Don't render if not visible
    if (!isVisible) {
      return null
    }

    // Determine if we should show an icon
    const shouldShowIcon = icon !== false && icon !== undefined
    const iconElement = shouldShowIcon ? (
      icon === true ? (
        <Icon name={variantIcons[variant || "default"]} />
      ) : (
        icon
      )
    ) : null

    return (
      <div
        ref={ref}
        data-slot="alert"
        data-dismissible={dismissible}
        role="alert"
        aria-live="polite"
        className={cn(
          alertVariants({ variant, size, elevation, rounded }),
          animated && "animate-in fade-in-0 slide-in-from-top-1 duration-200",
          isAnimatingOut && animated && "animate-out fade-out-0 slide-out-to-top-1 duration-200",
          className
        )}
        {...props}
      >
        {iconElement}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {dismissible && (
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              aria-label={closeLabel}
              className="h-6 w-6 p-0 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Icon name="close" className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }
)

Alert.displayName = "Alert"
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-inherit text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}
function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("flex items-center gap-2 mt-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertActions }
