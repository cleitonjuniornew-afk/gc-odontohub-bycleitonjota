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
import { clinicalProceduresRepository } from "@/repositories/clinical-procedures.repository";

import type {
Appointment,
ChecklistItem,
MaterialItem,
} from "@/types";

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

interface ClinicalProcedureData {
id: string;
nome: string;
descricao?: string;
disciplina?: string;
professor?: string;
checklist?: string[] | ChecklistItem[];
passoAPasso?: string[];
materiais?: string[] | MaterialItem[];
}

function normalizeChecklist(
items: string[] | ChecklistItem[] | undefined
): ChecklistItem[] {
if (!items || items.length === 0) {
return [];
}

return items.map((item, index) => {
if (typeof item === "string") {
return {
id: `protocol-checklist-${index + 1}`,
label: item,
done: false,
};
}

```
return {
  id: item.id || `protocol-checklist-${index + 1}`,
  label: item.label,
  done: false,
};
```

});
}

function normalizeMaterials(
items: string[] | MaterialItem[] | undefined
): MaterialItem[] {
if (!items || items.length === 0) {
return [];
}

return items.map((item, index) => {
if (typeof item === "string") {
return {
id: `protocol-material-${index + 1}`,
name: item,
quantity: 1,
};
}

```
return {
  id: item.id || `protocol-material-${index + 1}`,
  name: item.name,
  quantity: item.quantity ?? 1,
};
```

});
}

export function useAppointment(
appointmentId?: string,
procedureId?: string
) {
const [appointment, setAppointment] =
useState<Appointment | null>(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const saveTimeout =
useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
let cancelled = false;

```
async function init() {
  setLoading(true);

  try {
    /*
     * Se existe um ID de atendimento,
     * carregamos o atendimento existente.
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
     * Se não existe atendimento, mas existe
     * procedureId, carregamos o protocolo
     * cadastrado no Supabase.
     */
    if (procedureId) {
      const protocol =
        (await clinicalProceduresRepository.get(
          procedureId
        )) as ClinicalProcedureData | null;

      if (!protocol) {
        throw new Error(
          "Procedimento clínico não encontrado."
        );
      }

      const checklist =
        normalizeChecklist(
          protocol.checklist
        );

      const materials =
        normalizeMaterials(
          protocol.materiais
        );

      const created =
        await appointmentsRepository.create({
          procedureId: protocol.id,

          discipline:
            protocol.disciplina ?? "",

          professor:
            protocol.professor ?? "",

          procedure:
            protocol.nome,

          checklist,

          materials,

          clinicalNotes:
            protocol.descricao ?? "",

          timeline: [
            {
              id: crypto.randomUUID(),
              time: nowLabel(),
              description: `Atendimento iniciado — ${protocol.nome}`,
            },
          ],
        });

      if (!cancelled) {
        setAppointment(created);
      }

      return;
    }

    /*
     * Sem atendimento e sem procedimento:
     * cria um atendimento vazio.
     *
     * IMPORTANTE:
     * não existe mais procedimento fixo aqui.
     */
    const created =
      await appointmentsRepository.create({
        discipline: "",
        professor: "",
        procedure: "",
        checklist: [],
        materials: [],
        clinicalNotes: "",
        timeline: [
          {
            id: crypto.randomUUID(),
            time: nowLabel(),
            description:
              "Atendimento iniciado",
          },
        ],
      });

    if (!cancelled) {
      setAppointment(created);
    }
  } catch (error) {
    console.error(
      "Erro ao carregar atendimento:",
      error
    );

    if (!cancelled) {
      setAppointment(null);
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
```

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

```
  if (saveTimeout.current) {
    clearTimeout(saveTimeout.current);
  }

  saveTimeout.current = setTimeout(
    async () => {
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
    },
    500
  );
},
[appointment]
```

);

const addTimelineEntry = useCallback(
(description: string) => {
setAppointment((prev) => {
if (!prev) return prev;

```
    const timeline = [
      ...prev.timeline,
      {
        id: crypto.randomUUID(),
        time: nowLabel(),
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
```

);

const toggleChecklistItem = useCallback(
(id: string) => {
setAppointment((prev) => {
if (!prev) return prev;

```
    const checklist =
      prev.checklist.map((item) =>
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
},
[]
```

);

const addMaterial = useCallback(
(
material: Omit<MaterialItem, "id">
) => {
setAppointment((prev) => {
if (!prev) return prev;

```
    const materials = [
      ...prev.materials,
      {
        ...material,
        id: crypto.randomUUID(),
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
```

);

const removeMaterial = useCallback(
(id: string) => {
setAppointment((prev) => {
if (!prev) return prev;

```
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
```

);

const updateField = useCallback( <K extends keyof Appointment>(
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

```
  addTimelineEntry(
    `Paciente selecionado: ${patientName}`
  );
},
[persist, addTimelineEntry]
```

);

const addPhoto = useCallback(
async (
file: File,
meta: AddPhotoMeta
) => {
if (!appointment) {
throw new Error(
"Nenhum atendimento está carregado."
);
}

```
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
[appointment, addTimelineEntry]
```

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

```
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
```

);

const checklistProgress =
useMemo(() => {
if (!appointment) {
return {
done: 0,
total: 0,
};
}

```
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
```

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
