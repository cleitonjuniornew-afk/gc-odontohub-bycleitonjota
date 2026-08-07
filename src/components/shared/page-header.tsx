"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/variants";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn("mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center", className)}
    >
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
