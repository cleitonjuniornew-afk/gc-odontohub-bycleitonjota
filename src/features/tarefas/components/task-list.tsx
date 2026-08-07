"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, Pencil, Trash2, RotateCcw, Plus } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskCompleteModal } from "./task-complete-modal";
import { TaskFormModal } from "./task-form-modal";
import { useTasks } from "../hooks/use-tasks";
import { disciplines } from "@/lib/mock-data";
import type { Task } from "@/types";

const priorityVariant = { ALTA: "error", MEDIA: "warning", BAIXA: "default" } as const;

function disciplineName(id?: string) {
  return disciplines.find((d) => d.id === id)?.name;
}

export function TaskList() {
  const { tasks, isLoading, createTask, updateTask, completeTask, reopenTask, deleteTask } = useTasks();
  const [pendingComplete, setPendingComplete] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function handleToggle(task: Task) {
    if (!task.done) setPendingComplete(task);
    else reopenTask(task.id);
  }

  async function handleFormSubmit(data: Omit<Task, "id" | "done">) {
    if (editing) {
      await updateTask({ id: editing.id, input: data });
    } else {
      await createTask({ ...data, done: false });
    }
    setEditing(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Vamos começar?"
          description="Cadastre sua primeira tarefa e organize sua rotina acadêmica."
          actionLabel="Adicionar tarefa"
          onAction={() => setFormOpen(true)}
        />
      ) : (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
        <AnimatePresence initial={false}>
          {tasks.map((t) => (
            <motion.div key={t.id} variants={fadeInUp} layout exit={{ opacity: 0, x: 20 }}>
              <Card className="flex items-center gap-4 py-4">
                <Checkbox checked={t.done} onCheckedChange={() => handleToggle(t)} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.done ? "text-text-muted line-through" : "text-text-primary"}`}>
                    {t.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    {disciplineName(t.disciplineId) && <span>{disciplineName(t.disciplineId)}</span>}
                    {t.dueDate && (
                      <span>· {new Date(t.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    )}
                  </div>
                </div>
                <Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge>
                <div className="flex items-center gap-1">
                  {t.done && (
                    <button onClick={() => reopenTask(t.id)} title="Reabrir" className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-secondary">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => { setEditing(t); setFormOpen(true); }} title="Editar" className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteTask(t.id)} title="Excluir" className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-error">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}

      <TaskFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        onSubmit={handleFormSubmit}
        initialData={editing}
      />

      <TaskCompleteModal
        open={!!pendingComplete}
        taskTitle={pendingComplete?.title ?? ""}
        onOpenChange={(open) => !open && setPendingComplete(null)}
        onConfirm={(learned) => pendingComplete && completeTask({ id: pendingComplete.id, learned })}
      />
    </>
  );
}
