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

import type {
  Appointment,
  ChecklistItem,
  MaterialItem,
  PhotoItem,
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

export function useAppointment(appointmentId?: string) {
  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const saveTimeout =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      try {
        if (appointmentId) {
          const existing =
            await appointmentsRepository.get(appointmentId);

          if (!cancelled) {
            setAppointment(existing);
          }
        } else {
          const created =
            await appointmentsRepository.create({
              discipline:
                "Integrativa Dentística / Periodontia",

              professor:
                "Dra. Ana Militão",

              procedure:
                "Restauração Classe II",

              checklist: DEFAULT_CHECKLIST,
            });

          if (!cancelled) {
            setAppointment(created);
          }
        }
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
        clearTimeout(saveTimeout.current);
      }
    };
  }, [appointmentId]);

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
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(async () => {
        const current = appointment;

        if (!current) return;

        setSaving(true);

        try {
          await appointmentsRepository.update(
            current.id,
            patch
          );
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [appointment]
  );

  const addTimelineEntry = useCallback(
    (description: string) => {
      setAppointment((prev) => {
        if (!prev) return prev;

        const timeline = [
          ...prev.timeline,
          {
            id: crypto.randomUUID(),
            time: nowLabel(),
            description,
          },
        ];

        void appointmentsRepository.update(prev.id, {
          timeline,
        });

        return {
          ...prev,
          timeline,
        };
      });
    },
    []
  );

  const toggleChecklistItem = useCallback(
    (id: string) => {
      setAppointment((prev) => {
        if (!prev) return prev;

        const checklist = prev.checklist.map((item) =>
          item.id === id
            ? {
                ...item,
                done: !item.done,
              }
            : item
        );

        void appointmentsRepository.update(prev.id, {
          checklist,
        });

        return {
          ...prev,
          checklist,
        };
      });
    },
    []
  );

  const addMaterial = useCallback(
    (material: Omit<MaterialItem, "id">) => {
      setAppointment((prev) => {
        if (!prev) return prev;

        const materials = [
          ...prev.materials,
          {
            ...material,
            id: crypto.randomUUID(),
          },
        ];

        void appointmentsRepository.update(prev.id, {
          materials,
        });

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

  const removeMaterial = useCallback(
    (id: string) => {
      setAppointment((prev) => {
        if (!prev) return prev;

        const materials =
          prev.materials.filter(
            (material) => material.id !== id
          );

        void appointmentsRepository.update(prev.id, {
          materials,
        });

        return {
          ...prev,
          materials,
        };
      });
    },
    []
  );

  const updateField = useCallback(
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

  const selectPatient = useCallback(
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

  /**
   * Faz o upload REAL da foto.
   *
   * O page.tsx envia:
   *
   * addPhoto(file, {
   *   phase: "antes" | "durante" | "depois",
   *   patientId,
   *   appointmentId
   * })
   *
   * Aqui convertemos a fase para o formato
   * aceito pelo banco/repositório.
   */
  const addPhoto = useCallback(
    async (
      file: File,
      meta: AddPhotoMeta
    ): Promise<PhotoItem> => {
      if (!appointment) {
        throw new Error(
          "Nenhum atendimento está carregado."
        );
      }

      const phaseMap: Record<
        PhotoPhase,
        PhotoItem["phase"]
      > = {
        antes: "Antes",
        durante: "Durante",
        depois: "Depois",
      };

      const photo = await photosRepository.upload(
        file,
        {
          description:
            meta.description,

          phase:
            phaseMap[meta.phase],

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

      addTimelineEntry(
        `Foto adicionada — ${phaseMap[meta.phase]}`
      );

      return photo;
    },
    [appointment, addTimelineEntry]
  );

  const finish = useCallback(
    async (
      summary: Pick<
        Appointment,
        | "resumoComoFoi"
        | "resumoAprendizado"
        | "resumoFariaDiferente"
        | "resumoDificuldade"
      >
    ) => {
      if (!appointment) return;

      const finishedAt =
        new Date().toISOString();

      const timeline = [
        ...appointment.timeline,
        {
          id: crypto.randomUUID(),
          time: nowLabel(),
          description:
            "Atendimento finalizado",
        },
      ];

      const patch = {
        ...summary,
        status: "FINALIZADO" as const,
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

  const checklistProgress = useMemo(() => {
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
      total: appointment.checklist.length,
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
  };
}
