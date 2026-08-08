"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";

import { appointmentsRepository } from "@/repositories/appointments.repository";
import { photosRepository } from "@/repositories/photos.repository";
import {
  clinicalProceduresRepository,
  type ClinicalProcedure,
} from "@/repositories/clinical-procedures.repository";

import type {
  Appointment,
  ChecklistItem,
  MaterialItem,
} from "@/types";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "c1",
    label: "Separar materiais",
    done: false,
  },
  {
    id: "c2",
    label: "EPIs",
    done: false,
  },
  {
    id: "c3",
    label: "Fotografar antes",
    done: false,
  },
  {
    id: "c4",
    label: "Anamnese",
    done: false,
  },
  {
    id: "c5",
    label: "Radiografia",
    done: false,
  },
  {
    id: "c6",
    label: "Procedimento",
    done: false,
  },
  {
    id: "c7",
    label: "Fotografar depois",
    done: false,
  },
  {
    id: "c8",
    label: "Orientações",
    done: false,
  },
  {
    id: "c9",
    label: "Agendar retorno",
    done: false,
  },
];

function nowLabel() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PhotoPhase = "antes" | "durante" | "depois";

interface AddPhotoMeta {
  phase: PhotoPhase;
  disciplineId?: string;
  patientId?: string;
  appointmentId?: string;
  description?: string;
}

type UpdateableAppointmentField = keyof Appointment;

function normalizeChecklist(
  checklist: unknown
): ChecklistItem[] {
  if (!Array.isArray(checklist)) {
    return DEFAULT_CHECKLIST.map((item) => ({
      ...item,
    }));
  }

  const normalized = checklist
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `protocol-checklist-${index + 1}`,
          label: item,
          done: false,
        };
      }

      if (
        item &&
        typeof item === "object"
      ) {
        const data = item as {
          id?: string;
          label?: string;
          nome?: string;
          done?: boolean;
          concluido?: boolean;
        };

        const label =
          data.label ??
          data.nome ??
          "";

        if (!label) {
          return null;
        }

        return {
          id:
            data.id ??
            `protocol-checklist-${index + 1}`,
          label,
          done:
            data.done ??
            data.concluido ??
            false,
        };
      }

      return null;
    })
    .filter(
      (
        item
      ): item is ChecklistItem =>
        item !== null
    );

  return normalized.length > 0
    ? normalized
    : DEFAULT_CHECKLIST.map((item) => ({
        ...item,
      }));
}

function normalizeMaterials(
  materials: unknown
): MaterialItem[] {
  if (!Array.isArray(materials)) {
    return [];
  }

  return materials
    .map((material, index) => {
      if (typeof material === "string") {
        return {
          id: `protocol-material-${index + 1}`,
          name: material,
          quantity: 1,
        };
      }

      if (
        material &&
        typeof material === "object"
      ) {
        const data = material as {
          id?: string;
          nome?: string;
          name?: string;
          quantidade?: number;
          quantity?: number;
        };

        const name =
          data.nome ??
          data.name ??
          "";

        if (!name) {
          return null;
        }

        return {
          id:
            data.id ??
            `protocol-material-${index + 1}`,
          name,
          quantity:
            data.quantidade ??
            data.quantity ??
            1,
        };
      }

      return null;
    })
    .filter(
      (
        item
      ): item is MaterialItem =>
        item !== null
    );
}

function getProcedureChecklist(
  procedure: ClinicalProcedure | null
): ChecklistItem[] {
  if (!procedure) {
    return DEFAULT_CHECKLIST.map((item) => ({
      ...item,
    }));
  }

  return normalizeChecklist(
    procedure.checklist
  );
}

function getProcedureMaterials(
  procedure: ClinicalProcedure | null
): MaterialItem[] {
  if (!procedure) {
    return [];
  }

  return normalizeMaterials(
    procedure.materiais
  );
}

export function useAppointment(
  appointmentId?: string,
  procedureId?: string
) {
  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const saveTimeout =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const procedureRef =
    useRef<ClinicalProcedure | null>(
      null
    );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      try {
        /*
         * 1. Se já existe um atendimento,
         * simplesmente carregamos ele.
         */
        if (appointmentId) {
          const existing =
            await appointmentsRepository.get(
              appointmentId
            );

          if (!cancelled) {
            setAppointment(existing);
          }

          return;
        }

        /*
         * 2. Se foi escolhido um procedimento
         * predefinido, carregamos o protocolo.
         */
        let procedureData:
          | ClinicalProcedure
          | null = null;

        if (procedureId) {
          try {
            procedureData =
              await clinicalProceduresRepository.get(
                procedureId
              );
          } catch (error) {
            console.error(
              "Erro ao carregar procedimento clínico:",
              error
            );
          }
        }

        procedureRef.current =
          procedureData;

        /*
         * 3. Dados vindos do procedimento
         * predefinido.
         */
        const procedureName =
          procedureData?.nome ??
          "Procedimento clínico";

        const disciplineName =
          procedureData?.disciplina ??
          "";

        const checklist =
          getProcedureChecklist(
            procedureData
          );

        const materials =
          getProcedureMaterials(
            procedureData
          );

        /*
         * 4. Criamos o atendimento já com
         * procedimento, checklist e materiais.
         */
        const created =
          await appointmentsRepository.create(
            {
              discipline:
                disciplineName,

              professor: "",

              procedure:
                procedureName,

              procedureId:
                procedureData?.id ??
                procedureId,

              status:
                "EM_ANDAMENTO",

              checklist,

              materials,

              patientName:
                "Paciente não selecionado",

              clinicalNotes:
                procedureData?.descricao ??
                "",

              timeline: [
                {
                  id:
                    crypto.randomUUID(),

                  time:
                    nowLabel(),

                  description:
                    procedureId
                      ? `Atendimento iniciado — ${procedureName}`
                      : "Atendimento iniciado",
                },
              ],
            }
          );

        if (!cancelled) {
          setAppointment(created);
        }
      } catch (error) {
        console.error(
          "Erro ao inicializar atendimento:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;

      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current
        );
      }
    };
  }, [appointmentId, procedureId]);

  const persist = useCallback(
    (patch: Partial<Appointment>) => {
      setAppointment((prev) =>
        prev
          ? {
              ...prev,
              ...patch,
            }
          : prev
      );

      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current
        );
      }

      saveTimeout.current =
        setTimeout(async () => {
          setAppointment(
            (current) => {
              if (!current) {
                return current;
              }

              setSaving(true);

              void appointmentsRepository
                .update(
                  current.id,
                  patch
                )
                .finally(() => {
                  setSaving(false);
                });

              return current;
            }
          );
        }, 500);
    },
    []
  );

  const addTimelineEntry =
    useCallback(
      (description: string) => {
        setAppointment((prev) => {
          if (!prev) {
            return prev;
          }

          const timeline = [
            ...prev.timeline,
            {
              id:
                crypto.randomUUID(),

              time:
                nowLabel(),

              description,
            },
          ];

          void appointmentsRepository.update(
            prev.id,
            {
              timeline,
            }
          );

          return {
            ...prev,
            timeline,
          };
        });
      },
      []
    );

  const toggleChecklistItem =
    useCallback((id: string) => {
      setAppointment((prev) => {
        if (!prev) {
          return prev;
        }

        const checklist =
          prev.checklist.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    done: !item.done,
                  }
                : item
          );

        void appointmentsRepository.update(
          prev.id,
          {
            checklist,
          }
        );

        return {
          ...prev,
          checklist,
        };
      });
    }, []);

  const addMaterial =
    useCallback(
      (
        material: Omit<
          MaterialItem,
          "id"
        >
      ) => {
        setAppointment((prev) => {
          if (!prev) {
            return prev;
          }

          const materials = [
            ...prev.materials,
            {
              ...material,
              id:
                crypto.randomUUID(),
            },
          ];

          void appointmentsRepository.update(
            prev.id,
            {
              materials,
            }
          );

          return {
            ...prev,
            materials,
          };
        });

        addTimelineEntry(
          `Material adicionado: ${material.name}`
        );
      },
      [addTimelineEntry]
    );

  const removeMaterial =
    useCallback((id: string) => {
      setAppointment((prev) => {
        if (!prev) {
          return prev;
        }

        const materials =
          prev.materials.filter(
            (material) =>
              material.id !== id
          );

        void appointmentsRepository.update(
          prev.id,
          {
            materials,
          }
        );

        return {
          ...prev,
          materials,
        };
      });
    }, []);

  const updateField =
    useCallback(
      (
        field: UpdateableAppointmentField,
        value: Appointment[
          UpdateableAppointmentField
        ]
      ) => {
        persist({
          [field]: value,
        } as Partial<Appointment>);
      },
      [persist]
    );

  const selectPatient =
    useCallback(
      (
        patientId: string,
        patientName: string,
        patientAge?: number
      ) => {
        persist({
          patientId,
          patientName,
          patientAge,
        });

        addTimelineEntry(
          `Paciente selecionado: ${patientName}`
        );
      },
      [persist, addTimelineEntry]
    );

  const addPhoto =
    useCallback(
      async (
        file: File,
        meta: AddPhotoMeta
      ) => {
        if (!appointment) {
          throw new Error(
            "Nenhum atendimento está carregado."
          );
        }

        const photo =
          await photosRepository.upload(
            file,
            {
              description:
                meta.description,

              phase: meta.phase,

              disciplineId:
                meta.disciplineId,

              patientId:
                meta.patientId ??
                appointment.patientId,

              appointmentId:
                meta.appointmentId ??
                appointment.id,
            }
          );

        const phaseLabel = {
          antes: "Antes",
          durante: "Durante",
          depois: "Depois",
        }[meta.phase];

        addTimelineEntry(
          `Foto adicionada — ${phaseLabel}`
        );

        return photo;
      },
      [
        appointment,
        addTimelineEntry,
      ]
    );

  const finish =
    useCallback(
      async (
        summary: Pick<
          Appointment,
          | "resumoComoFoi"
          | "resumoAprendizado"
          | "resumoFariaDiferente"
          | "resumoDificuldade"
        >
      ) => {
        if (!appointment) {
          return;
        }

        const finishedAt =
          new Date().toISOString();

        const timeline = [
          ...appointment.timeline,
          {
            id:
              crypto.randomUUID(),

            time:
              nowLabel(),

            description:
              "Atendimento finalizado",
          },
        ];

        const patch = {
          ...summary,

          status:
            "FINALIZADO" as const,

          finishedAt,

          timeline,
        };

        await appointmentsRepository.update(
          appointment.id,
          patch
        );

        setAppointment((prev) =>
          prev
            ? {
                ...prev,
                ...patch,
              }
            : prev
        );
      },
      [appointment]
    );

  const checklistProgress =
    useMemo(() => {
      if (!appointment) {
        return {
          done: 0,
          total: 0,
        };
      }

      const done =
        appointment.checklist.filter(
          (item) => item.done
        ).length;

      return {
        done,
        total:
          appointment.checklist.length,
      };
    }, [appointment]);

  return {
    appointment,
    loading,
    saving,
    checklistProgress,
    toggleChecklistItem,
    addMaterial,
    removeMaterial,
    updateField,
    selectPatient,
    addPhoto,
    addTimelineEntry,
    finish,
    procedure:
      procedureRef.current,
  };
}
