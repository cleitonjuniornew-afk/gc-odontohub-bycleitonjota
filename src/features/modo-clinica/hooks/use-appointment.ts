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

function createDefaultChecklist(): ChecklistItem[] {
return [
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
}

function checklistFromProcedure(
procedure?: ClinicalProcedure | null
): ChecklistItem[] {
if (
procedure?.checklist &&
procedure.checklist.length > 0
) {
return procedure.checklist.map((item, index) => ({
id:
item.id ||
`protocol-checklist-${index + 1}`,
label: item.label,
done: false,
}));
}

return createDefaultChecklist();
}

function materialsFromProcedure(
procedure?: ClinicalProcedure | null
): MaterialItem[] {
if (
!procedure?.materiais ||
procedure.materiais.length === 0
) {
return [];
}

return procedure.materiais.map((material, index) => {
if (typeof material === "string") {
return {
id: `protocol-material-${index + 1}`,
name: material,
quantity: 1,
};
}

```
const materialData = material as {
  nome?: string;
  name?: string;
  quantidade?: number;
  quantity?: number;
};

return {
  id: `protocol-material-${index + 1}`,
  name:
    materialData.nome ??
    materialData.name ??
    "Material clínico",
  quantity:
    materialData.quantidade ??
    materialData.quantity ??
    1,
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

const [procedure, setProcedure] =
useState<ClinicalProcedure | null>(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);

const saveTimeout =
useRef<ReturnType<typeof setTimeout> | null>(
null
);

useEffect(() => {
let cancelled = false;

```
async function init() {
  setLoading(true);

  try {
    /*
     * 1. Se existe appointmentId,
     *    carregamos o atendimento existente.
     */
    if (appointmentId) {
      const existing =
        await appointmentsRepository.get(
          appointmentId
        );

      if (!cancelled) {
        setAppointment(existing);
      }

      /*
       * Se o atendimento já possui procedureId,
       * carregamos também o protocolo correspondente.
       */
      if (existing?.procedureId) {
        try {
          const procedures =
            await clinicalProceduresRepository.list();

          const found = procedures.find(
            (item) =>
              item.id === existing.procedureId
          );

          if (!cancelled) {
            setProcedure(found ?? null);
          }
        } catch (error) {
          console.error(
            "Erro ao carregar protocolo clínico:",
            error
          );
        }
      }

      return;
    }

    /*
     * 2. Novo atendimento:
     *    se foi escolhido um procedimento,
     *    carregamos o protocolo cadastrado.
     */
    let selectedProcedure:
      | ClinicalProcedure
      | null = null;

    if (procedureId) {
      try {
        const procedures =
          await clinicalProceduresRepository.list();

        selectedProcedure =
          procedures.find(
            (item) => item.id === procedureId
          ) ?? null;
      } catch (error) {
        console.error(
          "Erro ao carregar procedimento clínico:",
          error
        );
      }
    }

    if (!cancelled) {
      setProcedure(selectedProcedure);
    }

    /*
     * 3. Criamos o atendimento usando os dados
     *    do protocolo selecionado.
     */
    const created =
      await appointmentsRepository.create({
        patientName:
          "Paciente não selecionado",

        patientAge: undefined,

        patientId: undefined,

        procedureId:
          selectedProcedure?.id,

        discipline:
          selectedProcedure?.disciplina ??
          "Integrativa Dentística / Periodontia",

        professor:
          selectedProcedure?.professor ??
          "Dra. Ana Militão",

        procedure:
          selectedProcedure?.nome ??
          "Procedimento clínico",

        checklist:
          checklistFromProcedure(
            selectedProcedure
          ),

        materials:
          materialsFromProcedure(
            selectedProcedure
          ),

        clinicalNotes: "",

        timeline: [
          {
            id: crypto.randomUUID(),
            time: nowLabel(),
            description:
              selectedProcedure
                ? `Atendimento iniciado — ${selectedProcedure.nome}`
                : "Atendimento iniciado",
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
if (!prev) {
return prev;
}

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
if (!prev) {
return prev;
}

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
if (!prev) {
return prev;
}

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
if (!prev) {
return prev;
}

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
    await photosRepository.upload(file, {
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
    });

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
if (!appointment) {
return;
}

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

const checklistProgress = useMemo(() => {
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
```

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
