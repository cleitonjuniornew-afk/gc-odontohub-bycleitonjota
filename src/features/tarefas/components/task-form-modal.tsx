"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskFormInput } from "../schemas/task-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Task } from "@/types";
import { useDisciplines } from "@/features/disciplinas/hooks/use-disciplines";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormInput) => Promise<void> | void;
  submitting?: boolean;
  initialData?: Task | null;
}

export function TaskFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
}: Props) {

  const { disciplines } = useDisciplines();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "MEDIA" },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              title: initialData.title,
              description: initialData.description ?? "",
              priority: initialData.priority,
              dueDate: initialData.dueDate ?? "",
              disciplineId: initialData.disciplineId ?? "",
            }
          : {
              title: "",
              description: "",
              priority: "MEDIA",
              dueDate: "",
              disciplineId: "",
            }
      );
    }
  }, [open, initialData, reset]);


  async function submit(data: TaskFormInput) {
    await onSubmit(data);
    onOpenChange(false);
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar tarefa" : "Nova tarefa"}
          </DialogTitle>

          <DialogDescription>
            Organize sua rotina acadêmica em poucos segundos.
          </DialogDescription>
        </DialogHeader>


        <form onSubmit={handleSubmit(submit)} className="space-y-4">


          <div>
            <Label htmlFor="title">Título</Label>

            <Input
              id="title"
              placeholder="Ex: Revisar cronograma de Endodontia"
              className="mt-1.5"
              {...register("title")}
            />

            {errors.title && (
              <p className="mt-1 text-xs text-error">
                {errors.title.message}
              </p>
            )}
          </div>


          <div>
            <Label htmlFor="description">
              Descrição (opcional)
            </Label>

            <Textarea
              id="description"
              className="mt-1.5 min-h-20"
              {...register("description")}
            />
          </div>


          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label>Prioridade</Label>

              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="BAIXA">
                        Baixa
                      </SelectItem>

                      <SelectItem value="MEDIA">
                        Média
                      </SelectItem>

                      <SelectItem value="ALTA">
                        Alta
                      </SelectItem>
                    </SelectContent>

                  </Select>
                )}
              />

            </div>


            <div>
              <Label htmlFor="dueDate">
                Data
              </Label>

              <Input
                id="dueDate"
                type="date"
                className="mt-1.5"
                {...register("dueDate")}
              />

            </div>

          </div>


          <div>
            <Label>
              Disciplina (opcional)
            </Label>

            <Controller
              control={control}
              name="disciplineId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >

                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>


                  <SelectContent>

                    {disciplines.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}

                  </SelectContent>


                </Select>
              )}
            />

          </div>


          <div className="mt-2 flex justify-end gap-3">

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>


            <Button
              type="submit"
              loading={submitting}
            >
              {initialData ? "Salvar alterações" : "Criar tarefa"}
            </Button>

          </div>


        </form>

      </DialogContent>
    </Dialog>
  );
}
