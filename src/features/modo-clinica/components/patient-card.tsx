"use client";

import { User, ClipboardList } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientPicker } from "@/features/pacientes/components/patient-picker";
import type { Appointment, PatientProcedure } from "@/types";

interface Props {
  appointment: Appointment;
  onSelectPatient: (
    patientId: string,
    name: string,
    age?: number
  ) => void;
  onSelectProcedure?: (procedure: PatientProcedure) => void;
}

export function PatientCard({
  appointment,
  onSelectPatient,
  onSelectProcedure,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-primary" />
          Paciente
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!appointment.patientId ? (
          <PatientPicker
            onChange={(id, patient) => {
              onSelectPatient(
                id,
                patient.name,
                patient.age
              );
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">
                  Nome
                </span>

                <span className="text-right text-text-primary">
                  {appointment.patientName}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-text-secondary">
                  Idade
                </span>

                <span className="text-text-primary">
                  {appointment.patientAge ?? "—"} anos
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
            </div>

            {appointment.procedures &&
              appointment.procedures.length > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />

                    <span className="text-sm font-medium text-text-primary">
                      Procedimentos do paciente
                    </span>
                  </div>

                  <div className="space-y-2">
                    {appointment.procedures.map(
                      (procedure) => (
                        <button
                          key={procedure.id}
                          type="button"
                          onClick={() =>
                            onSelectProcedure?.(
                              procedure
                            )
                          }
                          className="w-full rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {procedure.procedure}
                              </p>

                              {procedure.tooth && (
                                <p className="mt-1 text-xs text-text-secondary">
                                  Dente:{" "}
                                  {procedure.tooth}
                                </p>
                              )}

                              {procedure.region && (
                                <p className="text-xs text-text-secondary">
                                  Região:{" "}
                                  {procedure.region}
                                </p>
                              )}

                              {procedure.details && (
                                <p className="mt-1 text-xs text-text-muted">
                                  {
                                    procedure.details
                                  }
                                </p>
                              )}
                            </div>

                            <Badge
                              variant={
                                procedure.status ===
                                "CONCLUIDO"
                                  ? "success"
                                  : procedure.status ===
                                    "EM_ANDAMENTO"
                                  ? "warning"
                                  : "primary"
                              }
                            >
                              {procedure.status ===
                              "CONCLUIDO"
                                ? "Concluído"
                                : procedure.status ===
                                  "EM_ANDAMENTO"
                                ? "Em andamento"
                                : "Planejado"}
                            </Badge>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

            {(!appointment.procedures ||
              appointment.procedures.length === 0) && (
              <div className="rounded-lg border border-dashed border-border p-3 text-center">
                <p className="text-xs text-text-muted">
                  Nenhum procedimento cadastrado
                  para este paciente.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
