"use client";

import { useEffect, useState } from "react";
import { User, ClipboardList } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { PatientPicker } from "@/features/pacientes/components/patient-picker";
import { usePatients } from "@/features/pacientes/hooks/use-patients";

import type { Appointment, Patient } from "@/types";

interface Props {
  appointment: Appointment;
  onSelectPatient: (
    patientId: string,
    name: string,
    age?: number
  ) => void;
  onSelectProcedure?: (
    procedureId: string,
    procedure: string
  ) => void;
}

export function PatientCard({
  appointment,
  onSelectPatient,
  onSelectProcedure,
}: Props) {
  const { patients } = usePatients();

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  useEffect(() => {
    if (!appointment.patientId) {
      setSelectedPatient(null);
      return;
    }

    const patient = patients.find(
      (p) => p.id === appointment.patientId
    );

    if (patient) {
      setSelectedPatient(patient);
    }
  }, [appointment.patientId, patients]);

  const handlePatientChange = (
    patientId: string,
    patient: Patient
  ) => {
    setSelectedPatient(patient);

    onSelectPatient(
      patientId,
      patient.name,
      patient.age
    );
  };

  const procedures =
    selectedPatient?.procedures ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-primary" />
          Paciente
        </CardTitle>
      </CardHeader>

      {!appointment.patientId ? (
        <PatientPicker
          onChange={handlePatientChange}
        />
      ) : (
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">
                Nome
              </span>

              <span className="text-text-primary">
                {appointment.patientName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">
                Idade
              </span>

              <span className="text-text-primary">
                {appointment.patientAge ?? "—"} anos
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">
                Disciplina
              </span>

              <span className="text-text-primary">
                {appointment.discipline}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">
                Professor avaliador
              </span>

              <span className="text-text-primary">
                {appointment.professor}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary">
                Dupla
              </span>

              <Badge variant="primary">
                Junior e Gabriel
              </Badge>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />

              <span className="font-medium text-text-primary">
                Procedimento
              </span>
            </div>

            {procedures.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm text-text-secondary">
                  Este paciente ainda não possui
                  procedimentos cadastrados.
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Cadastre um procedimento no cadastro
                  do paciente antes de iniciar o
                  atendimento.
                </p>
              </div>
            ) : (
              <Select
                value={
                  appointment.procedureId ?? undefined
                }
                onValueChange={(procedureId) => {
                  const procedure =
                    procedures.find(
                      (p) => p.id === procedureId
                    );

                  if (!procedure) return;

                  onSelectProcedure?.(
                    procedure.id,
                    procedure.procedure
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o procedimento" />
                </SelectTrigger>

                <SelectContent>
                  {procedures.map((procedure) => (
                    <SelectItem
                      key={procedure.id}
                      value={procedure.id}
                    >
                      {procedure.procedure}
                      {procedure.tooth
                        ? ` — Dente ${procedure.tooth}`
                        : ""}
                      {procedure.region
                        ? ` — ${procedure.region}`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {appointment.procedureId && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-text-muted">
                Procedimento selecionado
              </p>

              <p className="mt-1 font-medium text-text-primary">
                {appointment.procedure}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
