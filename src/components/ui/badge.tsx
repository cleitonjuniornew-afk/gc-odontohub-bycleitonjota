import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-card text-text-secondary border border-border",
        primary: "bg-primary/15 text-primary border border-primary/30",
        secondary: "bg-secondary/15 text-secondary border border-secondary/30",
        success: "bg-success/15 text-success border border-success/30",
        warning: "bg-warning/15 text-warning border border-warning/30",
        error: "bg-error/15 text-error border border-error/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
