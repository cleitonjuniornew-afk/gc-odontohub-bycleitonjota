"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "secondary" | "success" | "warning";
}

const accentMap = {
  primary: "text-primary bg-primary/10",
  secondary: "text-secondary bg-secondary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export function StatCard({ icon: Icon, label, value, hint, accent = "primary" }: StatCardProps) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="group cursor-default hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{label}</span>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110", accentMap[accent])}>
            <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold text-text-primary">{value}</div>
        {hint && <div className="mt-1 text-xs text-text-muted">{hint}</div>}
      </Card>
    </motion.div>
  );
}
