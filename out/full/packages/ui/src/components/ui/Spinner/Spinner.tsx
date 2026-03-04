import { cn } from "../../../lib/utils/cn"
import { Icon } from "../Icon/Icon"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <div className="animate-spin"><Icon name="progress_activity" role="status" aria-label="Loading" className={cn(className)} {...props} /></div>
  )
}

export { Spinner }
