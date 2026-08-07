"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { GradeFormModal } from "./grade-form-modal";
import { useGrades } from "../hooks/use-grades";
import { disciplines } from "@/lib/mock-data";
import { summarizeGrades } from "@/lib/grades";
import type { Grade } from "@/types";

const statusVariant = { aprovado: "success", recuperacao: "warning", reprovado: "error", em_andamento: "secondary" } as const;
const statusLabel = { aprovado: "Aprovado", recuperacao: "Recuperação", reprovado: "Reprovado", em_andamento: "Em andamento" } as const;

export function GradesPanel() {
  const { grades, isLoading, createGrade, isCreating, updateGrade, isUpdating, deleteGrade } = useGrades();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [defaultDiscipline, setDefaultDiscipline] = useState<string | undefined>();

  const withGrades = disciplines.filter((d) => grades.some((g) => g.disciplineId === d.id));

  async function handleSubmit(data: Omit<Grade, "id">) {
    if (editing) await updateGrade({ id: editing.id, input: data });
    else await createGrade(data);
    setEditing(null);
  }

  if (isLoading) {
    return <div className="grid gap-4 lg:grid-cols-2">{[1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}</div>;
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => { setEditing(null); setDefaultDiscipline(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Adicionar avaliação
        </Button>
      </div>

      {withGrades.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Vamos começar?" description="Cadastre a primeira avaliação de uma disciplina." actionLabel="Adicionar avaliação" onAction={() => setFormOpen(true)} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 lg:grid-cols-2">
          {withGrades.map((d) => {
            const disciplineGrades = grades.filter((g) => g.disciplineId === d.id);
            const summary = summarizeGrades(disciplineGrades);

            return (
              <motion.div key={d.id} variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>{d.name}</CardTitle>
                    <Badge variant={statusVariant[summary.status]}>{statusLabel[summary.status]}</Badge>
                  </CardHeader>

                  <div className="space-y-1.5">
                    {disciplineGrades.map((g) => (
                      <div key={g.id} className="group flex items-center justify-between rounded-lg px-1.5 py-1.5 text-sm hover:bg-white/[0.03]">
                        <span className="text-text-secondary">{g.name} <span className="text-text-muted">(peso {g.weight})</span></span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{g.score !== undefined ? g.score.toFixed(1) : "—"}</span>
                          <div className="hidden gap-1 group-hover:flex">
                            <button onClick={() => { setEditing(g); setFormOpen(true); }} className="rounded p-1 text-text-muted hover:text-text-primary"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => deleteGrade(g.id)} className="rounded p-1 text-text-muted hover:text-error"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Média atual</p>
                      <p className="font-semibold text-text-primary">{summary.weightedAverage !== null ? summary.weightedAverage.toFixed(1) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Precisa tirar</p>
                      <p className="font-semibold text-text-primary">{summary.neededForApproval !== null ? summary.neededForApproval.toFixed(1) : "—"}</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => { setEditing(null); setDefaultDiscipline(d.id); setFormOpen(true); }}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar avaliação nesta disciplina
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <GradeFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={editing}
        defaultDisciplineId={defaultDiscipline}
      />
    </div>
  );
}
