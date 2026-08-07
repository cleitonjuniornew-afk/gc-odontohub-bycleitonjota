"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

/** Estado padrão para módulos futuros (IA, Gamificação, Flashcards, etc.) */
export function ComingSoon({ icon: Icon, title, description, features }: ComingSoonProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto max-w-2xl py-10 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary glow-primary">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <Badge variant="primary" className="mb-4">
        <Sparkles className="h-3 w-3" /> Em breve
      </Badge>
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{description}</p>
      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        {features.map((f) => (
          <div key={f} className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 text-sm text-text-secondary">
            {f}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
