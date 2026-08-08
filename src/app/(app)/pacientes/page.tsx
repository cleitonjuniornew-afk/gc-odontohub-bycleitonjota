"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PatientList } from "@/features/pacientes/components/patient-list";
import { PatientFormModal } from "@/features/pacientes/components/patient-form-modal";
import { usePatients } from "@/features/pacientes/hooks/use-patients";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types";

export default function PacientesPage() {
  const {
    patients,
    isLoading,
    createPatient,
    isCreating,
    updatePatient,
    isUpdating,
  } = usePatients();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  function handleNewPatient() {
    setSelectedPatient(null);
    setModalOpen(true);
  }

  function handleSelectPatient(patient: Patient) {
    setSelectedPatient(patient);
    setModalOpen(true);
  }

  async function handleSubmit(data: Omit<Patient, "id">) {
    if (selectedPatient) {
      await updatePatient({
        id: selectedPatient.id,
        input: data,
      });
    } else {
      await createPatient(data);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro completo com procedimentos, retornos e observações."
        action={
          <Button onClick={handleNewPatient}>
            + Cadastrar paciente
          </Button>
        }
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando pacientes...
        </div>
      ) : (
        <PatientList
          patients={patients}
          onSelect={handleSelectPatient}
        />
      )}

      <PatientFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={selectedPatient}
      />
    </div>
  );
}
