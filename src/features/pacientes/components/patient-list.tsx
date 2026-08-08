"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { UserRound, Plus } from "lucide-react";

import type { Patient } from "@/types";
import { patients as mockPatients } from "@/lib/mock-data";
import { PatientFormModal } from "./patient-form-modal";

interface PatientListProps {
  patients?: Patient[];
  onSelect?: (patient: Patient) => void;
}

export function PatientList({
  patients: initialPatients,
  onSelect,
}: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>(
    initialPatients ?? mockPatients
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleNewPatient() {
    setSelectedPatient(null);
    setModalOpen(true);
  }

  function handleSelectPatient(patient: Patient) {
    if (onSelect) {
      onSelect(patient);
      return;
    }

    setSelectedPatient(patient);
    setModalOpen(true);
  }

  async function handleSubmit(data: Omit<Patient, "id">) {
    setSubmitting(true);

    try {
      if (selectedPatient) {
        const updatedPatient: Patient = {
          id: selectedPatient.id,
          ...data,
        };

        setPatients((current) =>
          current.map((patient) =>
            patient.id === selectedPatient.id
              ? updatedPatient
              : patient
          )
        );
      } else {
        const newPatient: Patient = {
          id: `pt-${Date.now()}`,
          ...data,
        };

        setPatients((current) => [...current, newPatient]);
      }
    } finally {
      setSubmitting(false);
      setSelectedPatient(null);
      setModalOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={handleNewPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar paciente
        </Button>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Nenhum paciente cadastrado"
          description="Cadastre seus pacientes para acompanhar os atendimentos clínicos."
          actionLabel="Cadastrar paciente"
          onAction={handleNewPatient}
        />
      ) : (
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              variants={fadeInUp}
            >
              <Card
                className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      {patient.name}
                    </h3>

                    {patient.phone && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {patient.phone}
                      </p>
                    )}

                    {patient.procedures.length > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {patient.procedures
                          .map((procedure) => procedure.procedure)
                          .join(", ")}
                      </p>
                    )}

                    {patient.nextReturn && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Próximo retorno:{" "}
                        {new Date(
                          patient.nextReturn
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>

                  {patient.procedures.length > 0 && (
                    <Badge variant="secondary">
                      {patient.procedures.length}{" "}
                      {patient.procedures.length === 1
                        ? "procedimento"
                        : "procedimentos"}
                    </Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <PatientFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);

          if (!open) {
            setSelectedPatient(null);
          }
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        initialData={selectedPatient}
      />
    </div>
  );
}
