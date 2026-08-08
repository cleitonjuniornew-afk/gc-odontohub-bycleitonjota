"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientSchema,
  type PatientFormInput,
} from "../schemas/patient-schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

export function PatientFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PatientFormInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone: "",
      birthDate: "",
      professor: "",
      procedures: [],
      nextReturn: "",
      notes: "",
    },
  });

  const birthDate = watch("birthDate");

  const computedAge = calculateAge(birthDate);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        name: initialData.name,
        phone: initialData.phone ?? "",
        birthDate: initialData.birthDate ?? "",
        professor: initialData.professor ?? "",
        procedures: initialData.procedures ?? [],
        nextReturn: initialData.nextReturn ?? "",
        notes: initialData.notes ?? "",
      });
    } else {
      reset({
        name: "",
        phone: "",
        birthDate: "",
        professor: "",
        procedures: [],
        nextReturn: "",
        notes: "",
      });
    }
  }, [open, initialData, reset]);

  async function submit(data: PatientFormInput) {
    await onSubmit({
      name: data.name,
      phone: data.phone || undefined,
      birthDate: data.birthDate || undefined,
      age: calculateAge(data.birthDate),
      professor: data.professor || undefined,

      procedures: data.procedures ?? [],

      nextReturn: data.nextReturn || undefined,
      notes: data.notes || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar paciente" : "Novo paciente"}
          </DialogTitle>

          <DialogDescription>
            A idade é calculada automaticamente a partir da data de nascimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div>
            <Label htmlFor="name">Nome</Label>

            <Input
              id="name"
              placeholder="Nome completo"
              className="mt-1.5"
              {...register("name")}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-error">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>

              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                className="mt-1.5"
                {...register("phone")}
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-error">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">Nascimento</Label>

              <Input
                id="birthDate"
                type="date"
                className="mt-1.5"
                {...register("birthDate")}
              />

              {computedAge !== undefined && (
                <p className="mt-1 text-xs text-text-muted">
                  Idade: {computedAge} anos
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="professor">
              Professor responsável
            </Label>

            <Input
              id="professor"
              placeholder="Nome do professor"
              className="mt-1.5"
              {...register("professor")}
            />
          </div>

          <div>
            <Label>Procedimentos</Label>

            <div className="mt-2 rounded-lg border border-border bg-card/40 p-3">
              <p className="text-sm font-medium text-text-primary">
                Procedimentos serão vinculados ao paciente
              </p>

              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                O cadastro estruturado de procedimentos, incluindo
                procedimento, dente/região, detalhes e status, será
                utilizado posteriormente no Modo Clínica.
              </p>

              <p className="mt-2 text-xs text-text-secondary">
                Nenhum procedimento cadastrado neste momento.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="nextReturn">
              Próximo retorno
            </Label>

            <Input
              id="nextReturn"
              type="date"
              className="mt-1.5"
              {...register("nextReturn")}
            />
          </div>

          <div>
            <Label htmlFor="notes">
              Observações
            </Label>

            <Textarea
              id="notes"
              placeholder="Observações gerais sobre o paciente..."
              className="mt-1.5 min-h-24"
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {initialData
                ? "Salvar alterações"
                : "Cadastrar paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
