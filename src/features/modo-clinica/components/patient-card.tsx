"use client";
import { User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientPicker } from "@/features/pacientes/components/patient-picker";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
  onSelectPatient: (patientId: string, name: string, age?: number) => void;
}

export function PatientCard({ appointment, onSelectPatient }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-4.5 w-4.5 text-primary" /> Paciente</CardTitle>
      </CardHeader>

      {!appointment.patientId ? (
        <PatientPicker onChange={(id, patient) => onSelectPatient(id, patient.name, patient.age)} />
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-text-secondary">Nome</span><span className="text-text-primary">{appointment.patientName}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Idade</span><span className="text-text-primary">{appointment.patientAge ?? "—"} anos</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Disciplina</span><span className="text-text-primary">{appointment.discipline}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Professor avaliador</span><span className="text-text-primary">{appointment.professor}</span></div>
          <div className="flex items-center justify-between"><span className="text-text-secondary">Dupla</span><Badge variant="primary">Junior e Gabriel</Badge></div>
        </div>
      )}
    </Card>
  );
}
