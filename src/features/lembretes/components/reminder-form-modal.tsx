"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reminderSchema, type ReminderFormInput } from "../schemas/reminder-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Reminder } from "@/repositories/reminders.repository";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Reminder, "id">) => Promise<void> | void;
  submitting?: boolean;
  initialData?: Reminder | null;
}

export function ReminderFormModal({ open, onOpenChange, onSubmit, submitting, initialData }: Props) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ReminderFormInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { recurring: false },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? { title: initialData.title, category: initialData.category ?? "", recurring: initialData.recurring, date: initialData.date ?? "" }
          : { title: "", category: "", recurring: false, date: "" }
      );
    }
  }, [open, initialData, reset]);

  async function submit(data: ReminderFormInput) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar lembrete" : "Novo lembrete"}</DialogTitle>
          <DialogDescription>Lembretes recorrentes ou avulsos, organizados por categoria.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex: Levar radiografia impressa" className="mt-1.5" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input id="category" placeholder="Ex: Clínica, Estudo, Documentos" className="mt-1.5" {...register("category")} />
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" className="mt-1.5" {...register("date")} />
          </div>
          <div className="flex items-center gap-2.5">
            <Controller control={control} name="recurring" render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} id="recurring" />
            )} />
            <Label htmlFor="recurring" className="cursor-pointer">Lembrete recorrente</Label>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={submitting}>{initialData ? "Salvar alterações" : "Criar lembrete"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
