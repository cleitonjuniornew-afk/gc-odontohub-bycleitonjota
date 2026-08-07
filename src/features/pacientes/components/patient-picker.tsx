"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PatientFormModal } from "./patient-form-modal";
import { usePatients } from "../hooks/use-patients";
import type { Patient } from "@/types";

interface Props {
  value?: string;
  onChange: (patientId: string, patient: Patient) => void;
}

/** Seletor de paciente reutilizável — usado em Casos Clínicos e no Modo
 * Atendimento. Se não existir nenhum paciente cadastrado, oferece o cadastro
 * sem sair da tela atual. */
export function PatientPicker({ value, onChange }: Props) {
  const { patients, createPatient, isCreating } = usePatients();
  const [formOpen, setFormOpen] = useState(false);

  if (patients.length === 0) {
    return (
      <>
        <Button type="button" variant="ghost" className="w-full" onClick={() => setFormOpen(true)}>
          <UserPlus className="h-4 w-4" /> Cadastrar paciente
        </Button>
        <PatientFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          submitting={isCreating}
          onSubmit={async (data) => {
            const patient = await createPatient(data);
            onChange(patient.id, patient);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex gap-2">
      <Select
        value={value}
        onValueChange={(id) => {
          const patient = patients.find((p) => p.id === id);
          if (patient) onChange(id, patient);
        }}
      >
        <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione o paciente..." /></SelectTrigger>
        <SelectContent>
          {patients.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" variant="ghost" size="icon" onClick={() => setFormOpen(true)} title="Cadastrar novo paciente">
        <UserPlus className="h-4 w-4" />
      </Button>
      <PatientFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        submitting={isCreating}
        onSubmit={async (data) => {
          const patient = await createPatient(data);
          onChange(patient.id, patient);
        }}
      />
    </div>
  );
}
