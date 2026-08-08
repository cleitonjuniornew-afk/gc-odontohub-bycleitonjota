"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { clinicalModeTransition, staggerContainer } from "@/animations/variants";
import { useAppointment } from "@/features/modo-clinica/hooks/use-appointment";
import { Skeleton } from "@/components/ui/skeleton";

import { ClinicalHeader } from "@/features/modo-clinica/components/clinical-header";
import { PatientCard } from "@/features/modo-clinica/components/patient-card";
import { ProcedureCard } from "@/features/modo-clinica/components/procedure-card";
import { ChecklistCard } from "@/features/modo-clinica/components/checklist-card";
import { PhotosCard } from "@/features/modo-clinica/components/photos-card";
import { NotesCard } from "@/features/modo-clinica/components/notes-card";
import { MaterialsCard } from "@/features/modo-clinica/components/materials-card";
import {
  ComplicationsCard,
  ProfessorObservationsCard,
  PendenciesCard,
  ReturnCard,
} from "@/features/modo-clinica/components/secondary-cards";
import { TimelineCard } from "@/features/modo-clinica/components/timeline-card";
import { FloatingActionButton } from "@/features/modo-clinica/components/floating-action-button";
import { FinishAppointmentModal } from "@/features/modo-clinica/components/finish-appointment-modal";
import { AppointmentFinishedView } from "@/features/modo-clinica/components/appointment-finished-view";

function ModoAtendimentoInner() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("id") ?? undefined;

  const {
    appointment,
    loading,
    saving,
    toggleChecklistItem,
    addMaterial,
    removeMaterial,
    updateField,
    selectPatient,
    addPhoto,
    addTimelineEntry,
    finish,
  } = useAppointment(appointmentId);

  const [finishModalOpen, setFinishModalOpen] = useState(false);

  if (loading || !appointment) {
    return (
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-3 lg:py-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[420px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (appointment.status === "FINALIZADO") {
    return (
      <AppointmentFinishedView
        appointment={appointment}
      />
    );
  }

  /*
   * Abre o fluxo real de adição de foto.
   *
   * O PhotosCard agora pode chamar esta função passando:
   * - arquivo
   * - fase
   */
  const handleAddPhoto = async (
    file: File,
    phase: "antes" | "durante" | "depois"
  ) => {
    try {
      await addPhoto(file, {
        phase,
        disciplineId: undefined,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
      });

      toast.success("Foto adicionada.");
    } catch (error) {
      console.error("Erro ao adicionar foto:", error);
      toast.error("Não foi possível adicionar a foto.");
    }
  };

  return (
    <motion.div
      variants={clinicalModeTransition}
      initial="hidden"
      animate="visible"
    >
      <ClinicalHeader
        startedAt={appointment.startedAt}
        saving={saving}
        onFinish={() => setFinishModalOpen(true)}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-6xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-3 lg:py-8"
      >
        <div className="space-y-5">
          <PatientCard
            appointment={appointment}
            onSelectPatient={selectPatient}
          />

          <ProcedureCard appointment={appointment} />

          <ChecklistCard
            checklist={appointment.checklist}
            onToggle={toggleChecklistItem}
          />
        </div>

        <div className="space-y-5">
          <PhotosCard onAdd={handleAddPhoto} />

          <NotesCard
            value={appointment.clinicalNotes}
            onChange={(v) => updateField("clinicalNotes", v)}
          />

          <MaterialsCard
            materials={appointment.materials}
            onAdd={addMaterial}
            onRemove={removeMaterial}
          />
        </div>

        <div className="space-y-5">
          <ComplicationsCard
            appointment={appointment}
            onChange={updateField}
          />

          <ProfessorObservationsCard
            appointment={appointment}
            onChange={updateField}
          />

          <PendenciesCard
            appointment={appointment}
            onChange={updateField}
          />

          <ReturnCard
            appointment={appointment}
            onChange={updateField}
          />

          <TimelineCard
            timeline={appointment.timeline}
          />
        </div>
      </motion.div>

      <FloatingActionButton
        onPhoto={() => {
          const input = document.createElement("input");

          input.type = "file";
          input.accept = "image/*";

          input.onchange = async () => {
            const file = input.files?.[0];

            if (!file) return;

            await handleAddPhoto(file, "durante");
          };

          input.click();
        }}
        onNote={() =>
          addTimelineEntry("Observação adicionada")
        }
        onMaterial={() =>
          addTimelineEntry("Material adicionado")
        }
        onPendency={() =>
          addTimelineEntry("Pendência adicionada")
        }
      />

      <FinishAppointmentModal
        open={finishModalOpen}
        onOpenChange={setFinishModalOpen}
        onConfirm={async (data) => {
          await finish(data);
          setFinishModalOpen(false);
          toast.success("Atendimento finalizado com sucesso.");
        }}
      />
    </motion.div>
  );
}

export default function ModoAtendimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-5 py-8">
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      }
    >
      <ModoAtendimentoInner />
    </Suspense>
  );
}
