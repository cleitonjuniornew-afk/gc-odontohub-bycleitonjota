"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Pencil, Trash2, Repeat } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReminderFormModal } from "@/features/lembretes/components/reminder-form-modal";
import { useReminders } from "@/features/lembretes/hooks/use-reminders";
import type { Reminder } from "@/repositories/reminders.repository";

export default function LembretesPage() {
  const { reminders, isLoading, createReminder, isCreating, updateReminder, isUpdating, deleteReminder } = useReminders();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);

  async function handleSubmit(data: Omit<Reminder, "id">) {
    if (editing) await updateReminder({ id: editing.id, input: data });
    else await createReminder(data);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Lembretes"
        description="Lembretes recorrentes e avulsos, organizados por categoria."
        action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Novo lembrete</Button>}
      />

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Vamos começar?"
          description="Crie seu primeiro lembrete para nunca mais esquecer um prazo importante."
          actionLabel="Adicionar lembrete"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {reminders.map((r) => (
            <motion.div key={r.id} variants={fadeInUp}>
              <Card className="group flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{r.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    {r.category && <Badge>{r.category}</Badge>}
                    {r.date && <span>{new Date(r.date).toLocaleDateString("pt-BR")}</span>}
                    {r.recurring && <span className="flex items-center gap-1"><Repeat className="h-3 w-3" /> Recorrente</span>}
                  </div>
                </div>
                <div className="hidden gap-1 group-hover:flex">
                  <button onClick={() => { setEditing(r); setFormOpen(true); }} className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteReminder(r.id)} className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ReminderFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={editing}
      />
    </div>
  );
}
