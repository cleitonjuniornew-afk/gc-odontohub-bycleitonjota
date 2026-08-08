"use client";

import { useEffect } from "react";
import {
  useForm,
  Controller,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  gradeSchema,
  type GradeFormInput,
} from "../schemas/grade-schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { Grade } from "@/types";
import type { Discipline } from "@/repositories/disciplines.repository";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<Grade, "id">
  ) => Promise<void> | void;
  submitting?: boolean;
  initialData?: Grade | null;
  defaultDisciplineId?: string;
  disciplines: Discipline[];
}

export function GradeFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
  defaultDisciplineId,
  disciplines,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GradeFormInput>({
    resolver: zodResolver(gradeSchema),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      initialData
        ? {
            disciplineId:
              initialData.disciplineId,
            name: initialData.name,
            weight: initialData.weight,
            maxValue:
              initialData.maxValue,
            score:
              initialData.score ?? "",
            date:
              initialData.date ?? "",
          }
        : {
            disciplineId:
              defaultDisciplineId ?? "",
            name: "",
            weight: 1,
            maxValue: 10,
            score: "",
            date: "",
          }
    );
  }, [
    open,
    initialData,
    defaultDisciplineId,
    reset,
  ]);

  async function submit(
    data: GradeFormInput
  ) {
    await onSubmit({
      disciplineId:
        data.disciplineId,
      name: data.name,
      weight: data.weight,
      maxValue: data.maxValue,
      score:
        data.score === "" ||
        data.score === undefined
          ? undefined
          : Number(data.score),
      date:
        data.date || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Editar avaliação"
              : "Nova avaliação"}
          </DialogTitle>

          <DialogDescription>
            A média e a situação são calculadas
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-4"
        >
          <div>
            <Label>
              Disciplina
            </Label>

            <Controller
              control={control}
              name="disciplineId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={
                    field.onChange
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>

                  <SelectContent>
                    {disciplines.map(
                      (discipline) => (
                        <SelectItem
                          key={
                            discipline.id
                          }
                          value={
                            discipline.id
                          }
                        >
                          {discipline.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              )}
            />

            {disciplines.length ===
              0 && (
              <p className="mt-1 text-xs text-text-muted">
                Nenhuma disciplina
                cadastrada.
              </p>
            )}

            {errors.disciplineId && (
              <p className="mt-1 text-xs text-error">
                {
                  errors.disciplineId
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">
              Nome da avaliação
            </Label>

            <Input
              id="name"
              placeholder="Ex: Prova 1, Trabalho, Prática"
              className="mt-1.5"
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-error">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="weight">
                Peso
              </Label>

              <Input
                id="weight"
                type="number"
                step="0.1"
                className="mt-1.5"
                {...register("weight")}
              />
            </div>

            <div>
              <Label htmlFor="maxValue">
                Valor máx.
              </Label>

              <Input
                id="maxValue"
                type="number"
                step="0.1"
                className="mt-1.5"
                {...register("maxValue")}
              />
            </div>

            <div>
              <Label htmlFor="score">
                Nota obtida
              </Label>

              <Input
                id="score"
                type="number"
                step="0.1"
                placeholder="—"
                className="mt-1.5"
                {...register("score")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date">
              Data
            </Label>

            <Input
              id="date"
              type="date"
              className="mt-1.5"
              {...register("date")}
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              loading={submitting}
              disabled={
                disciplines.length === 0
              }
            >
              {initialData
                ? "Salvar alterações"
                : "Adicionar avaliação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
