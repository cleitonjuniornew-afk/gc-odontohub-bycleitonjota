"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useObjectives } from "@/features/objetivos/hooks/use-objectives";

export function WeeklyGoalCard() {
  const { objectives, isLoading } = useObjectives("semanal");

  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4.5 w-4.5 text-primary" /> Meta da semana
          </CardTitle>
        </CardHeader>
        {isLoading ? (
          <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : (
          <div className="space-y-4">
            {objectives.slice(0, 3).map((g) => {
              const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{g.title}</span>
                    <span className="font-medium text-text-primary">{g.progress} / {g.target}</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
