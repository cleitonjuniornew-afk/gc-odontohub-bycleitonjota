import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => (
    <div className="relative flex items-center">
      {icon && <span className="pointer-events-none absolute left-3.5 text-text-muted">{icon}</span>}
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-4 text-sm text-text-primary placeholder:text-text-muted",
          "transition-all duration-150 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25",
          icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";

export { Input };
