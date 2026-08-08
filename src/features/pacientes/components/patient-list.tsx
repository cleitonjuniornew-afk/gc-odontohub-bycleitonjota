"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { UserRound } from "lucide-react";

import type { Patient } from "@/types";

interface PatientListProps {
  patients: Patient[];
  onSelect?: (patient: Patient) => void;
}

export function PatientList({ patients, onSelect }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nenhum paciente cadastrado"
        description="Cadastre seus pacientes para acompanhar os atendimentos clínicos."
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
      className="grid gap-4"
    >
      {patients.map((p) => (
        <motion.div key={p.id} variants={fadeInUp}>
          <Card
            className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
            onClick={() => onSelect?.(p)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold">{p.name}</h3>

                {p.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.phone}
                  </p>
                )}

                {p.procedures.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.procedures.map((proc) => proc.procedure).join(", ")}
                  </p>
                )}

                {p.nextReturn && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Próximo retorno:{" "}
                    {new Date(p.nextReturn).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              {p.procedures.length > 0 && (
                <Badge variant="secondary">
                  {p.procedures.length}{" "}
                  {p.procedures.length === 1 ? "procedimento" : "procedimentos"}
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
