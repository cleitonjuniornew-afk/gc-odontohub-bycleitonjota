"use client";

import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientPicker } from "@/features/pacientes/components/patient-picker";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
  onSelectPatient: (
    patientId: string,
    name: string,
    age?: number
  ) => void;
}

export function PatientCard({
  appointment,
  onSelectPatient,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Paciente
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!appointment.patientId ? (
          <PatientPicker
            onChange={(id, patient) =>
              onSelectPatient(
                id,
                patient.name,
                patient.age
              )
            }
          />
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">
                Nome
              </span>

              <span className="text-right font-medium text-text-primary">
                {appointment.patientName || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">
                Idade
              </span>

              <span className="text-text-primary">
                {appointment.patientAge
                  ? `${appointment.patientAge} anos`
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">
                Disciplina
              </span>

              <span className="text-right text-text-primary">
                {appointment.discipline || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">
                Professor avaliador
              </span>

              <span className="text-right text-text-primary">
                {appointment.professor || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-text-secondary">
                Dupla
              </span>

              <Badge variant="primary">
                Junior e Gabriel
              </Badge>
            </div>

            {appointment.procedure && (
              <div className="mt-4 rounded-lg border border-border bg-surface-secondary p-3">
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Procedimento clínico
                </div>

                <div className="font-semibold text-text-primary">
                  {appointment.procedure}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
