"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useTasks } from "@/features/tarefas/hooks/use-tasks";

const priorityVariant = { ALTA: "error", MEDIA: "warning", BAIXA: "default" } as const;

export function FocusTasks() {
  const { tasks, isLoading, completeTask, reopenTask } = useTasks();
  const focusTasks = tasks.filter((t) => !t.done).slice(0, 3);

  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" /> Foco do dia
          </CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
          </div>
        ) : focusTasks.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nenhuma pendência para hoje"
            description="Que tal adiantar uma revisão amanhã?"
          />
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {focusTasks.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
                >
                  <Checkbox
                    checked={t.done}
                    onCheckedChange={() => (t.done ? reopenTask(t.id) : completeTask({ id: t.id }))}
                  />
                  <span className={`flex-1 text-sm ${t.done ? "text-text-muted line-through" : "text-text-primary"}`}>
                    {t.title}
                  </span>
                  <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>
    </motion.div>
  );
}
