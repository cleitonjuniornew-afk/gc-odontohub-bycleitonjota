"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PatientList } from "@/features/pacientes/components/patient-list";
import { PatientFormModal } from "@/features/pacientes/components/patient-form-modal";
import { usePatients } from "@/features/pacientes/hooks/use-patients";
import type { Patient } from "@/types";

export default function PacientesPage() {
  const {
    patients,
    isLoading,
    createPatient,
    isCreating,
    updatePatient,
    isUpdating,
    deletePatient,
  } = usePatients();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  function handleNewPatient() {
    setEditingPatient(null);
    setFormOpen(true);
  }

  function handleEditPatient(patient: Patient) {
    setEditingPatient(patient);
    setFormOpen(true);
  }

  async function handleSubmit(data: Omit<Patient, "id">) {
    if (editingPatient) {
      await updatePatient({
        id: editingPatient.id,
        input: data,
      });
    } else {
      await createPatient(data);
    }

    setFormOpen(false);
    setEditingPatient(null);
  }

  function handleDeletePatient(patient: Patient) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o paciente "${patient.name}"?`
    );

    if (!confirmed) return;

    deletePatient(patient.id);
  }

  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro completo com procedimentos, retornos e observações."
      />

      <PatientList
        patients={patients}
        isLoading={isLoading}
        onAdd={handleNewPatient}
        onSelect={handleEditPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />

      <PatientFormModal
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingPatient(null);
          }
        }}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={editingPatient}
      />
    </div>
  );
}
