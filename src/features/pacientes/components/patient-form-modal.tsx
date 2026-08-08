"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";

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
import type {
  Patient,
  PatientProcedure,
} from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<Patient, "id">
  ) => Promise<void> | void;
  submitting?: boolean;
  initialData?: Patient | null;
}

interface ProcedureDraft {
  id: string;
  procedure: string;
  status: PatientProcedure["status"];
  tooth: string;
  region: string;
  details: string;
}

const EMPTY_PROCEDURE: ProcedureDraft = {
  id: "",
  procedure: "",
  status: "PLANEJADO",
  tooth: "",
  region: "",
  details: "",
};

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

  const [procedures, setProcedures] = useState<
    PatientProcedure[]
  >([]);

  const [procedureDraft, setProcedureDraft] =
    useState<ProcedureDraft>(EMPTY_PROCEDURE);

  const [editingProcedureId, setEditingProcedureId] =
    useState<string | null>(null);

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
        initialData.procedures ?? []
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

    setProcedureDraft(EMPTY_PROCEDURE);
    setEditingProcedureId(null);
  }, [open, initialData, reset]);

  function updateDraft(
    field: keyof ProcedureDraft,
    value: string
  ) {
    setProcedureDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveProcedureDraft() {
    if (!procedureDraft.procedure.trim()) {
      return;
    }

    const procedure: PatientProcedure = {
      id:
        editingProcedureId ||
        procedureDraft.id ||
        crypto.randomUUID(),

      procedure:
        procedureDraft.procedure.trim(),

      status: procedureDraft.status,

      tooth:
        procedureDraft.tooth.trim() ||
        undefined,

      region:
        procedureDraft.region.trim() ||
        undefined,

      details:
        procedureDraft.details.trim() ||
        undefined,
    };

    if (editingProcedureId) {
      setProcedures((prev) =>
        prev.map((item) =>
          item.id === editingProcedureId
            ? procedure
            : item
        )
      );
    } else {
      setProcedures((prev) => [
        ...prev,
        procedure,
      ]);
    }

    setProcedureDraft(
      EMPTY_PROCEDURE
    );

    setEditingProcedureId(null);
  }

  function editProcedure(
    procedure: PatientProcedure
  ) {
    setEditingProcedureId(
      procedure.id
    );

    setProcedureDraft({
      id: procedure.id,
      procedure: procedure.procedure,
      status: procedure.status,
      tooth: procedure.tooth ?? "",
      region: procedure.region ?? "",
      details: procedure.details ?? "",
    });
  }

  function removeProcedure(id: string) {
    setProcedures((prev) =>
      prev.filter(
        (procedure) =>
          procedure.id !== id
      )
    );

    if (editingProcedureId === id) {
      setEditingProcedureId(null);
      setProcedureDraft(
        EMPTY_PROCEDURE
      );
    }
  }

  function cancelProcedureEdit() {
    setEditingProcedureId(null);
    setProcedureDraft(
      EMPTY_PROCEDURE
    );
  }

  async function submit(
    data: PatientFormInput
  ) {
    await onSubmit({
      name: data.name,

      phone:
        data.phone || undefined,

      birthDate:
        data.birthDate || undefined,

      age: calculateAge(
        data.birthDate
      ),

      professor:
        data.professor || undefined,

      procedures,

      nextReturn:
        data.nextReturn || undefined,

      notes:
        data.notes || undefined,
    });

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Editar paciente"
              : "Novo paciente"}
          </DialogTitle>

          <DialogDescription>
            A idade é calculada automaticamente
            a partir da data de nascimento.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          {/* NOME */}
          <div>
            <Label htmlFor="name">
              Nome
            </Label>

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

          {/* TELEFONE / NASCIMENTO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">
                Telefone
              </Label>

              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                className="mt-1.5"
                {...register("phone")}
              />
            </div>

            <div>
              <Label htmlFor="birthDate">
                Nascimento
              </Label>

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

          {/* PROFESSOR */}
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

          {/* PROCEDIMENTOS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>
                  Procedimentos
                </Label>

                <p className="mt-1 text-xs text-text-muted">
                  Cadastre os procedimentos
                  planejados ou realizados
                  para este paciente.
                </p>
              </div>

              {procedures.length > 0 && (
                <span className="text-xs text-text-muted">
                  {procedures.length}{" "}
                  {procedures.length === 1
                    ? "procedimento"
                    : "procedimentos"}
                </span>
              )}
            </div>

            {/* PROCEDIMENTOS CADASTRADOS */}
            {procedures.length > 0 && (
              <div className="space-y-2">
                {procedures.map(
                  (procedure) => (
                    <div
                      key={procedure.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary">
                            {
                              procedure.procedure
                            }
                          </p>

                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                            <span>
                              {procedure.status ===
                              "PLANEJADO"
                                ? "Planejado"
                                : procedure.status ===
                                    "EM_ANDAMENTO"
                                  ? "Em andamento"
                                  : "Concluído"}
                            </span>

                            {procedure.tooth && (
                              <span>
                                Dente:{" "}
                                {
                                  procedure.tooth
                                }
                              </span>
                            )}

                            {procedure.region && (
                              <span>
                                Região:{" "}
                                {
                                  procedure.region
                                }
                              </span>
                            )}
                          </div>

                          {procedure.details && (
                            <p className="mt-2 text-sm text-text-secondary">
                              {
                                procedure.details
                              }
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              editProcedure(
                                procedure
                              )
                            }
                            title="Editar procedimento"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeProcedure(
                                procedure.id
                              )
                            }
                            title="Excluir procedimento"
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ADICIONAR / EDITAR PROCEDIMENTO */}
            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <div className="mb-3 flex items-center gap-2">
                {editingProcedureId ? (
                  <Pencil className="h-4 w-4 text-primary" />
                ) : (
                  <Plus className="h-4 w-4 text-primary" />
                )}

                <p className="text-sm font-medium text-text-primary">
                  {editingProcedureId
                    ? "Editar procedimento"
                    : "Adicionar procedimento"}
                </p>
              </div>

              <div className="space-y-3">
                {/* PROCEDIMENTO */}
                <div>
                  <Label>
                    Procedimento
                  </Label>

                  <Input
                    value={
                      procedureDraft.procedure
                    }
                    onChange={(e) =>
                      updateDraft(
                        "procedure",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Restauração Classe II"
                    className="mt-1.5"
                  />
                </div>

                {/* STATUS / DENTE */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>
                      Status
                    </Label>

                    <select
                      value={
                        procedureDraft.status
                      }
                      onChange={(e) =>
                        updateDraft(
                          "status",
                          e.target.value
                        )
                      }
                      className="mt-1.5 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
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

                  <div>
                    <Label>
                      Dente
                    </Label>

                    <Input
                      value={
                        procedureDraft.tooth
                      }
                      onChange={(e) =>
                        updateDraft(
                          "tooth",
                          e.target.value
                        )
                      }
                      placeholder="Ex.: 26"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* REGIÃO */}
                <div>
                  <Label>
                    Região
                  </Label>

                  <Input
                    value={
                      procedureDraft.region
                    }
                    onChange={(e) =>
                      updateDraft(
                        "region",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Distal, vestibular..."
                    className="mt-1.5"
                  />
                </div>

                {/* DETALHES */}
                <div>
                  <Label>
                    Detalhes clínicos
                  </Label>

                  <Textarea
                    value={
                      procedureDraft.details
                    }
                    onChange={(e) =>
                      updateDraft(
                        "details",
                        e.target.value
                      )
                    }
                    placeholder="Descreva informações importantes sobre este procedimento..."
                    className="mt-1.5 min-h-20"
                  />
                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-2">
                  {editingProcedureId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={
                        cancelProcedureEdit
                      }
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={
                      saveProcedureDraft
                    }
                    disabled={
                      !procedureDraft.procedure.trim()
                    }
                  >
                    {editingProcedureId ? (
                      <>
                        <Check className="h-4 w-4" />
                        Salvar procedimento
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Adicionar procedimento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RETORNO */}
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

          {/* OBSERVAÇÕES */}
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

          {/* AÇÕES */}
          <div className="flex justify-end gap-3 pt-2">
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
