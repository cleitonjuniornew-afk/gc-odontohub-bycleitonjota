import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-28 rounded-[var(--radius-input)] border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted",
        "transition-all duration-150 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25 resize-none",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
