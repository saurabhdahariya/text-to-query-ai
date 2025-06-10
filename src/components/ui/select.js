import * as React from "react"
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, value, onValueChange, placeholder, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    {...props}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {children}
  </select>
))
Select.displayName = "Select"

const SelectTrigger = Select
const SelectContent = ({ children }) => <>{children}</>
const SelectValue = ({ placeholder }) => null // Not needed for native select
const SelectItem = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
)

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
}
