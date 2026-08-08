"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  UserRound,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Patient } from "@/types";

interface PatientListProps {
  patients: Patient[];
  isLoading?: boolean;
  onAdd?: () => void;
  onSelect?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

export function PatientList({
  patients,
  isLoading,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
}: PatientListProps) {
  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Carregando pacientes...
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nenhum paciente cadastrado"
        description="Cadastre seus pacientes para acompanhar os atendimentos clínicos."
        actionLabel="Cadastrar paciente"
        onAction={onAdd}
      />
    );
  }

  return (
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
      className="space-y-4"
    >
      <div className="flex justify-end">
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar paciente
        </Button>
      </div>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <motion.div
            key={patient.id}
            variants={fadeInUp}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => onSelect?.(patient)}
                >
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
                        .map((proc) =>
                          typeof proc === "string"
                            ? proc
                            : proc.procedure
                        )
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

                <div className="flex shrink-0 items-center gap-2">
                  {patient.procedures.length > 0 && (
                    <Badge variant="secondary">
                      {patient.procedures.length}{" "}
                      {patient.procedures.length === 1
                        ? "procedimento"
                        : "procedimentos"}
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Editar paciente"
                    onClick={() => onEdit?.(patient)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Excluir paciente"
                    onClick={() => onDelete?.(patient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
