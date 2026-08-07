"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface/50 px-8 py-16 text-center"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {actionLabel && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
