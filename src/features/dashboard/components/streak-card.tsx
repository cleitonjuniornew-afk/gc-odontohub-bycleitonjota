"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { streak } from "@/lib/mock-data";

export function StreakCard() {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="glow-primary bg-gradient-to-br from-primary/[0.08] to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Flame className="h-6 w-6" fill="currentColor" strokeWidth={1} />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{streak.current} dias</p>
            <p className="text-xs text-text-secondary">de estudo consecutivos</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
          <span>Maior sequência: {streak.longest} dias</span>
          <span>Meta: {streak.goal} dias</span>
        </div>
      </Card>
    </motion.div>
  );
}
