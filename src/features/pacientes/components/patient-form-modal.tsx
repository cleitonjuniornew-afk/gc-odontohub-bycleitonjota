"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormInput } from "../schemas/patient-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/age";
import type { Patient } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Patient, "id">) => Promise<void> | void;
  submitting?: boolean;
  initialData?: Patient | null;
}

export function PatientFormModal({ open, onOpenChange, onSubmit, submitting, initialData }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PatientFormInput>({ resolver: zodResolver(patientSchema) });

  const birthDate = watch("birthDate");
  const computedAge = calculateAge(birthDate);

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              name: initialData.name,
              phone: initialData.phone ?? "",
              birthDate: initialData.birthDate ?? "",
              professor: initialData.professor ?? "",
              procedures: initialData.procedures.join(", "),
              nextReturn: initialData.nextReturn ?? "",
              notes: initialData.notes ?? "",
            }
          : { name: "", phone: "", birthDate: "", professor: "", procedures: "", nextReturn: "", notes: "" }
      );
    }
  }, [open, initialData, reset]);

  async function submit(data: PatientFormInput) {
    await onSubmit({
      name: data.name,
      phone: data.phone || undefined,
      birthDate: data.birthDate || undefined,
      age: calculateAge(data.birthDate),
      professor: data.professor || undefined,
      procedures: data.procedures ? data.procedures.split(",").map((p) => p.trim()).filter(Boolean) : [],
      nextReturn: data.nextReturn || undefined,
      notes: data.notes || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar paciente" : "Novo paciente"}</DialogTitle>
          <DialogDescription>A idade é calculada automaticamente a partir da data de nascimento.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Nome completo" className="mt-1.5" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(00) 00000-0000" className="mt-1.5" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="birthDate">Nascimento</Label>
              <Input id="birthDate" type="date" className="mt-1.5" {...register("birthDate")} />
              {computedAge !== undefined && <p className="mt-1 text-xs text-text-muted">Idade: {computedAge} anos</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="professor">Professor responsável</Label>
            <Input id="professor" className="mt-1.5" {...register("professor")} />
          </div>

          <div>
            <Label htmlFor="procedures">Procedimentos (separados por vírgula)</Label>
            <Input id="procedures" placeholder="Restauração Classe II, Profilaxia" className="mt-1.5" {...register("procedures")} />
          </div>

          <div>
            <Label htmlFor="nextReturn">Próximo retorno</Label>
            <Input id="nextReturn" type="date" className="mt-1.5" {...register("nextReturn")} />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" className="mt-1.5 min-h-20" {...register("notes")} />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={submitting}>{initialData ? "Salvar alterações" : "Cadastrar paciente"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
