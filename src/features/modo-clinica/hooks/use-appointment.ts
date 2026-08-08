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
import { patientsRepository } from "@/repositories/patients.repository";

import {
  clinicalProceduresRepository,
  type ClinicalProcedure,
} from "@/repositories/clinical-procedures.repository";

import type {
  Appointment,
  ChecklistItem,
  MaterialItem,
  PatientProcedure,
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

function cloneDefaultChecklist(): ChecklistItem[] {
  return DEFAULT_CHECKLIST.map((item) => ({
    ...item,
  }));
}

function normalizeChecklist(
  checklist: unknown
): ChecklistItem[] {
  if (!Array.isArray(checklist)) {
    return cloneDefaultChecklist();
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
    : cloneDefaultChecklist();
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
    return cloneDefaultChecklist();
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

function getPatientProcedureName(
  procedure: PatientProcedure
): string {
  return (
    procedure.procedure ??
    ""
  );
}

function getPatientProcedureDetails(
  procedure: PatientProcedure
): string {
  const details: string[] = [];

  if (procedure.tooth) {
    details.push(
      `Dente: ${procedure.tooth}`
    );
  }

  if (procedure.region) {
    details.push(
      `Região: ${procedure.region}`
    );
  }

  if (procedure.details) {
    details.push(
      procedure.details
    );
  }

  return details.join(" • ");
}

export function useAppointment(
  appointmentId?: string,
  procedureId?: string
) {
  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [procedure, setProcedure] =
    useState<ClinicalProcedure | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const saveTimeout =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      try {
        /*
         * ATENDIMENTO EXISTENTE
         */
        if (appointmentId) {
          const existing =
            await appointmentsRepository.get(
              appointmentId
            );

          if (!cancelled) {
            setAppointment(existing);
          }

          if (
            existing?.procedureId
          ) {
            try {
              const procedureData =
                await clinicalProceduresRepository.get(
                  existing.procedureId
                );

              if (!cancelled) {
                setProcedure(
                  procedureData
                );
              }
            } catch (error) {
              console.error(
                "Erro ao carregar protocolo clínico:",
                error
              );

              if (!cancelled) {
                setProcedure(null);
              }
            }
          }

          return;
        }

        /*
         * NOVO ATENDIMENTO COM PROCEDIMENTO
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

        if (!cancelled) {
          setProcedure(
            procedureData
          );
        }

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

                  description: procedureId
                    ? `Atendimento iniciado — ${procedureName}`
                    : "Atendimento iniciado",
                },
              ],
            }
          );

        if (!cancelled) {
          setAppointment(
            created
          );
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
  }, [
    appointmentId,
    procedureId,
  ]);

  /*
   * SALVAMENTO AUTOMÁTICO
   */
  const persist = useCallback(
    (
      patch: Partial<Appointment>
    ) => {
      setAppointment((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          ...patch,
        };
      });

      if (saveTimeout.current) {
        clearTimeout(
          saveTimeout.current
        );
      }

      saveTimeout.current =
        setTimeout(async () => {
          const current =
            await new Promise<Appointment | null>(
              (resolve) => {
                setAppointment(
                  (currentAppointment) => {
                    resolve(
                      currentAppointment
                    );

                    return currentAppointment;
                  }
                );
              }
            );

          if (!current) {
            return;
          }

          setSaving(true);

          try {
            await appointmentsRepository.update(
              current.id,
              patch
            );
          } catch (error) {
            console.error(
              "Erro ao salvar atendimento:",
              error
            );
          } finally {
            setSaving(false);
          }
        }, 500);
    },
    []
  );

  /*
   * TIMELINE
   */
  const addTimelineEntry =
    useCallback(
      (
        description: string
      ) => {
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

  /*
   * CHECKLIST
   */
  const toggleChecklistItem =
    useCallback(
      (id: string) => {
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
                      done:
                        !item.done,
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
      },
      []
    );

  /*
   * ADICIONAR MATERIAL
   */
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

  /*
   * REMOVER MATERIAL
   */
  const removeMaterial =
    useCallback(
      (id: string) => {
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
      },
      []
    );

  /*
   * ATUALIZAR CAMPOS
   */
  const updateField =
    useCallback(
      <K extends keyof Appointment>(
        field: K,
        value: Appointment[K]
      ) => {
        persist({
          [field]: value,
        } as Partial<Appointment>);
      },
      [persist]
    );

  /*
   * SELECIONAR PACIENTE
   *
   * AQUI ESTÁ A CORREÇÃO PRINCIPAL.
   *
   * Ao escolher o paciente:
   * 1. Busca o paciente completo.
   * 2. Carrega os procedimentos cadastrados.
   * 3. Pega o primeiro procedimento planejado.
   * 4. Preenche o atendimento.
   * 5. Tenta encontrar um protocolo clínico
   *    correspondente.
   */
  const selectPatient =
    useCallback(
      async (
        patientId: string,
        patientName: string,
        patientAge?: number
      ) => {
        try {
          const patient =
            await patientsRepository.get(
              patientId
            );

          const patientProcedures =
            patient.procedures ??
            [];

          const plannedProcedure =
            patientProcedures.find(
              (item) =>
                item.status ===
                "PLANEJADO"
            ) ??
            patientProcedures[0] ??
            null;

          let clinicalProcedure:
            | ClinicalProcedure
            | null = null;

          /*
           * Primeiro tenta procurar um
           * protocolo clínico pelo nome
           * do procedimento.
           */
          if (
            plannedProcedure
              ?.procedure
          ) {
            try {
              const allProcedures =
                await clinicalProceduresRepository.list();

              clinicalProcedure =
                allProcedures.find(
                  (item) =>
                    item.nome
                      ?.trim()
                      .toLowerCase() ===
                    plannedProcedure.procedure
                      .trim()
                      .toLowerCase()
                ) ??
                null;
            } catch (error) {
              console.error(
                "Não foi possível localizar o protocolo clínico:",
                error
              );
            }
          }

          if (
            clinicalProcedure
          ) {
            setProcedure(
              clinicalProcedure
            );
          } else {
            setProcedure(null);
          }

          const procedureName =
            plannedProcedure
              ? getPatientProcedureName(
                  plannedProcedure
                )
              : "";

          const procedureDetails =
            plannedProcedure
              ? getPatientProcedureDetails(
                  plannedProcedure
                )
              : "";

          const patientProfessor =
            patient.professor ??
            "";

          const protocolChecklist =
            clinicalProcedure
              ? getProcedureChecklist(
                  clinicalProcedure
                )
              : appointment?.checklist?.length
                ? appointment.checklist
                : cloneDefaultChecklist();

          const protocolMaterials =
            clinicalProcedure
              ? getProcedureMaterials(
                  clinicalProcedure
                )
              : appointment?.materials ??
                [];

          const discipline =
            clinicalProcedure?.disciplina ??
            appointment?.discipline ??
            "";

          const professor =
            clinicalProcedure
              ? ""
              : patientProfessor;

          const clinicalNotes =
            [
              clinicalProcedure?.descricao ??
                "",
              procedureDetails,
            ]
              .filter(Boolean)
              .join("\n\n");

          const patch: Partial<Appointment> =
            {
              patientId,
              patientName:
                patient.name ??
                patientName,
              patientAge:
                patient.age ??
                patientAge,

              procedure:
                procedureName ||
                appointment?.procedure ||
                "Procedimento clínico",

              procedureId:
                clinicalProcedure?.id ??
                appointment?.procedureId,

              discipline,

              professor,

              checklist:
                protocolChecklist,

              materials:
                protocolMaterials,

              clinicalNotes:
                clinicalNotes ||
                appointment?.clinicalNotes ||
                "",
            };

          setAppointment((prev) => {
            if (!prev) {
              return prev;
            }

            return {
              ...prev,
              ...patch,
            };
          });

          if (appointment) {
            await appointmentsRepository.update(
              appointment.id,
              patch
            );
          }

          const timelineDescription =
            procedureName
              ? `Paciente selecionado: ${patient.name ?? patientName} — ${procedureName}`
              : `Paciente selecionado: ${patient.name ?? patientName}`;

          addTimelineEntry(
            timelineDescription
          );
        } catch (error) {
          console.error(
            "Erro ao carregar dados do paciente:",
            error
          );

          /*
           * Mesmo se a busca completa
           * falhar, mantém a seleção
           * básica do paciente.
           */
          persist({
            patientId,
            patientName,
            patientAge,
          });

          addTimelineEntry(
            `Paciente selecionado: ${patientName}`
          );
        }
      },
      [
        appointment,
        persist,
        addTimelineEntry,
      ]
    );

  /*
   * ADICIONAR FOTO
   */
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

              phase:
                meta.phase,

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

  /*
   * FINALIZAR ATENDIMENTO
   */
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

  /*
   * PROGRESSO DO CHECKLIST
   */
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
    procedure,
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
  };
}
