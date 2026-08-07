"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormInput, TYPE_COLOR, TYPE_LABEL } from "../schemas/event-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { AgendaEvent } from "@/types";
import { useDisciplines } from "@/features/disciplinas/hooks/use-disciplines";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<AgendaEvent, "id">) => Promise<void> | void;
  submitting?: boolean;
  initialData?: AgendaEvent | null;
  defaultDate?: string;
}

function splitDateTime(iso?: string) {
  if (!iso) return { date: "", time: "" };

  const d = new Date(iso);

  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}

export function EventFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
  defaultDate,
}: Props) {
  const { disciplines } = useDisciplines();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const { date, time } = splitDateTime(initialData.start);

        reset({
          title: initialData.title,
          type: initialData.type,
          date,
          time,
          disciplineId: initialData.disciplineId ?? "",
        });
      } else {
        reset({
          title: "",
          type: "evento",
          date: defaultDate ?? "",
          time: "09:00",
          disciplineId: "",
        });
      }
    }
  }, [open, initialData, defaultDate, reset]);

  async function submit(data: EventFormInput) {
    const start = new Date(
      `${data.date}T${data.time || "09:00"}:00`
    ).toISOString();

    await onSubmit({
      title: data.title,
      type: data.type,
      color: TYPE_COLOR[data.type],
      start,
      disciplineId: data.disciplineId || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar evento" : "Novo evento"}
          </DialogTitle>

          <DialogDescription>
            Provas, clínicas e aulas — tudo em um só calendário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">

          <div>
            <Label htmlFor="title">Título</Label>

            <Input
              id="title"
              placeholder="Ex: Prova de Semiologia"
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
            <Label>Tipo</Label>

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(TYPE_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              )}
            />
          </div>


          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label htmlFor="date">Data</Label>

              <Input
                id="date"
                type="date"
                className="mt-1.5"
                {...register("date")}
              />

              {errors.date && (
                <p className="mt-1 text-xs text-error">
                  {errors.date.message}
                </p>
              )}
            </div>


            <div>
              <Label htmlFor="time">Hora</Label>

              <Input
                id="time"
                type="time"
                className="mt-1.5"
                {...register("time")}
              />
            </div>

          </div>


          <div>
            <Label>Disciplina (opcional)</Label>

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
                        {d.nome}
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
              {initialData ? "Salvar alterações" : "Criar evento"}
            </Button>

          </div>

        </form>

      </DialogContent>
    </Dialog>
  );
}
