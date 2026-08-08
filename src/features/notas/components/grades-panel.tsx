"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  staggerContainer,
  fadeInUp,
} from "@/animations/variants";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

import { GradeFormModal } from "./grade-form-modal";
import { useGrades } from "../hooks/use-grades";

import { disciplinesRepository } from "@/repositories/disciplines.repository";

import { summarizeGrades } from "@/lib/grades";
import type { Grade } from "@/types";
import type { Discipline } from "@/repositories/disciplines.repository";

const statusVariant = {
  aprovado: "success",
  recuperacao: "warning",
  reprovado: "error",
  em_andamento: "secondary",
} as const;

const statusLabel = {
  aprovado: "Aprovado",
  recuperacao: "Recuperação",
  reprovado: "Reprovado",
  em_andamento: "Em andamento",
} as const;

export function GradesPanel() {
  const {
    grades,
    isLoading: gradesLoading,
    createGrade,
    isCreating,
    updateGrade,
    isUpdating,
    deleteGrade,
  } = useGrades();

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [disciplinesLoading, setDisciplinesLoading] =
    useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] =
    useState<Grade | null>(null);

  const [defaultDiscipline, setDefaultDiscipline] =
    useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function loadDisciplines() {
      setDisciplinesLoading(true);

      try {
        const data =
          await disciplinesRepository.list();

        if (!cancelled) {
          setDisciplines(data);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar disciplinas:",
          error
        );

        if (!cancelled) {
          setDisciplines([]);
        }
      } finally {
        if (!cancelled) {
          setDisciplinesLoading(false);
        }
      }
    }

    void loadDisciplines();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    data: Omit<Grade, "id">
  ) {
    if (editing) {
      await updateGrade({
        id: editing.id,
        input: data,
      });
    } else {
      await createGrade(data);
    }

    setEditing(null);
  }

  const withGrades = disciplines.filter(
    (discipline) =>
      grades.some(
        (grade) =>
          grade.disciplineId === discipline.id
      )
  );

  const loading =
    gradesLoading || disciplinesLoading;

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <Skeleton
            key={item}
            className="h-64 w-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setDefaultDiscipline(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar avaliação
        </Button>
      </div>

      {withGrades.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Vamos começar?"
          description={
            disciplines.length === 0
              ? "Cadastre uma disciplina primeiro para depois adicionar avaliações."
              : "Cadastre a primeira avaliação de uma disciplina."
          }
          actionLabel="Adicionar avaliação"
          onAction={() => {
            setEditing(null);
            setDefaultDiscipline(undefined);
            setFormOpen(true);
          }}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
        >
          {withGrades.map((discipline) => {
            const disciplineGrades =
              grades.filter(
                (grade) =>
                  grade.disciplineId ===
                  discipline.id
              );

            const summary =
              summarizeGrades(
                disciplineGrades
              );

            return (
              <motion.div
                key={discipline.id}
                variants={fadeInUp}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="break-words">
                          {discipline.name}
                        </CardTitle>

                        {discipline.professor && (
                          <p className="mt-1 text-xs text-text-muted">
                            {discipline.professor}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant={
                          statusVariant[
                            summary.status
                          ]
                        }
                      >
                        {
                          statusLabel[
                            summary.status
                          ]
                        }
                      </Badge>
                    </div>
                  </CardHeader>

                  <div className="space-y-1.5 px-6">
                    {disciplineGrades.map(
                      (grade) => (
                        <div
                          key={grade.id}
                          className="group flex items-center justify-between gap-3 rounded-lg px-1.5 py-1.5 text-sm hover:bg-white/[0.03]"
                        >
                          <span className="min-w-0 break-words text-text-secondary">
                            {grade.name}{" "}
                            <span className="text-text-muted">
                              (peso{" "}
                              {grade.weight})
                            </span>
                          </span>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-medium text-text-primary">
                              {grade.score !==
                              undefined
                                ? grade.score.toFixed(
                                    1
                                  )
                                : "—"}
                            </span>

                            <div className="hidden gap-1 group-hover:flex">
                              <button
                                onClick={() => {
                                  setEditing(
                                    grade
                                  );
                                  setDefaultDiscipline(
                                    grade.disciplineId
                                  );
                                  setFormOpen(
                                    true
                                  );
                                }}
                                className="rounded p-1 text-text-muted hover:text-text-primary"
                                aria-label="Editar avaliação"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>

                              <button
                                onClick={() =>
                                  deleteGrade(
                                    grade.id
                                  )
                                }
                                className="rounded p-1 text-text-muted hover:text-error"
                                aria-label="Excluir avaliação"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mx-6 mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">
                        Média atual
                      </p>

                      <p className="font-semibold text-text-primary">
                        {summary.weightedAverage !==
                        null
                          ? summary.weightedAverage.toFixed(
                              1
                            )
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted">
                        Precisa tirar
                      </p>

                      <p className="font-semibold text-text-primary">
                        {summary.neededForApproval !==
                        null
                          ? summary.neededForApproval.toFixed(
                              1
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setEditing(null);
                        setDefaultDiscipline(
                          discipline.id
                        );
                        setFormOpen(true);
                      }}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Adicionar avaliação nesta disciplina
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <GradeFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditing(null);
            setDefaultDiscipline(undefined);
          }
        }}
        onSubmit={handleSubmit}
        submitting={
          isCreating || isUpdating
        }
        initialData={editing}
        defaultDisciplineId={
          defaultDiscipline
        }
        disciplines={disciplines}
      />
    </div>
  );
}
