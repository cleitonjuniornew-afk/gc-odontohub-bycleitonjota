"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientSchema,
  type PatientFormInput,
  type PatientProcedureFormInput,
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
  onSubmit: (data: Omit<Patient, "id">) => Promise | void;
  submitting?: boolean;
  initialData?: Patient | null;
}

const PROCEDURE_OPTIONS = [
  "Consulta / Avaliação",
  "Profilaxia",
  "Raspagem periodontal",
  "Aplicação tópica de flúor",
  "Restauração Classe I",
  "Restauração Classe II",
  "Restauração Classe III",
  "Restauração Classe IV",
  "Restauração Classe V",
  "Selante",
  "Clareamento dental",
  "Tratamento endodôntico",
  "Retratamento endodôntico",
  "Acesso endodôntico",
  "Curativo endodôntico",
  "Exodontia simples",
  "Exodontia de terceiro molar",
  "Cirurgia periodontal",
  "Gengivectomia",
  "Frenectomia",
  "Ulotomia / Ulectomia",
  "Manutenção periodontal",
  "Prótese provisória",
  "Moldagem",
  "Ajuste oclusal",
  "Placa oclusal",
  "Aplicação de dessensibilizante",
  "Radiografia",
  "Outro",
];

const INITIAL_PROCEDURE: PatientProcedureFormInput = {
  id: "",
  procedure: "",
  tooth: "",
  region: "",
  details: "",
  status: "PLANEJADO",
};

export function PatientFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
}: Props) {
  const [procedures, setProcedures] = useState<
    PatientProcedureFormInput[]
  >([]);

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

      setProcedures(
        (initialData.procedures ?? []).map((procedure) => ({
          id: procedure.id,
          procedure: procedure.procedure,
          tooth: procedure.tooth ?? "",
          region: procedure.region ?? "",
          details: procedure.details ?? "",
          status: procedure.status ?? "PLANEJADO",
        }))
      );
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

      setProcedures([]);
    }
  }, [open, initialData, reset]);

  function addProcedure() {
    setProcedures((current) => [
      ...current,
      {
        ...INITIAL_PROCEDURE,
        id: crypto.randomUUID(),
      },
    ]);
  }

  function updateProcedure(
    id: string,
    field: keyof PatientProcedureFormInput,
    value: string
  ) {
    setProcedures((current) =>
      current.map((procedure) =>
        procedure.id === id
          ? {
              ...procedure,
              [field]: value,
            }
          : procedure
      )
    );
  }

  function removeProcedure(id: string) {
    setProcedures((current) =>
      current.filter((procedure) => procedure.id !== id)
    );
  }

  async function submit(data: PatientFormInput) {
    const validProcedures = procedures.filter(
      (procedure) => procedure.procedure.trim() !== ""
    );

    await onSubmit({
      name: data.name,
      phone: data.phone || undefined,
      birthDate: data.birthDate || undefined,
      age: calculateAge(data.birthDate),
      professor: data.professor || undefined,
      procedures: validProcedures,
      nextReturn: data.nextReturn || undefined,
      notes: data.notes || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar paciente" : "Novo paciente"}
          </DialogTitle>

          <DialogDescription>
            A idade é calculada automaticamente a partir da data de
            nascimento. Cadastre os procedimentos individualmente para
            acompanhar dentes, regiões e detalhes clínicos.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefone</Label>

              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                className="mt-1.5"
                {...register("phone")}
              />
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

          <div className="rounded-xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Procedimentos
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Cadastre cada procedimento separadamente.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={addProcedure}
              >
                Adicionar
              </Button>
            </div>

            {procedures.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-5 text-center">
                <p className="text-sm text-text-muted">
                  Nenhum procedimento cadastrado.
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={addProcedure}
                >
                  Adicionar primeiro procedimento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {procedures.map((procedure, index) => (
                  <div
                    key={procedure.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Procedimento {index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeProcedure(procedure.id)
                        }
                        className="text-xs text-error hover:underline"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label>
                          Procedimento
                        </Label>

                        <select
                          value={procedure.procedure}
                          onChange={(event) =>
                            updateProcedure(
                              procedure.id,
                              "procedure",
                              event.target.value
                            )
                          }
                          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">
                            Selecione o procedimento
                          </option>

                          {PROCEDURE_OPTIONS.map((option) => (
                            <option
                              key={option}
                              value={option}
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label>
                            Dente
                          </Label>

                          <Input
                            placeholder="Ex.: 16"
                            value={procedure.tooth ?? ""}
                            onChange={(event) =>
                              updateProcedure(
                                procedure.id,
                                "tooth",
                                event.target.value
                              )
                            }
                          />

                          <p className="mt-1 text-[11px] text-text-muted">
                            Ex.: 11, 16, 26, 36, 46
                          </p>
                        </div>

                        <div>
                          <Label>
                            Região
                          </Label>

                          <Input
                            placeholder="Ex.: Arcada superior"
                            value={procedure.region ?? ""}
                            onChange={(event) =>
                              updateProcedure(
                                procedure.id,
                                "region",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>
                          Detalhes clínicos
                        </Label>

                        <Textarea
                          placeholder="Ex.: restauração Classe II, distal, resina composta..."
                          className="mt-1.5 min-h-20"
                          value={procedure.details ?? ""}
                          onChange={(event) =>
                            updateProcedure(
                              procedure.id,
                              "details",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <Label>
                          Status
                        </Label>

                        <select
                          value={procedure.status}
                          onChange={(event) =>
                            updateProcedure(
                              procedure.id,
                              "status",
                              event.target.value
                            )
                          }
                          className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="PLANEJADO">
                            Planejado
                          </option>

                          <option value="EM_ANDAMENTO">
                            Em andamento
                          </option>

                          <option value="CONCLUIDO">
                            Concluído
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              Observações gerais
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
