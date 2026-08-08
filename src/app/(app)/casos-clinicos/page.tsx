"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
Stethoscope,
PlayCircle,
Clock,
CheckCircle2,
ClipboardList,
} from "lucide-react";

import {
staggerContainer,
fadeInUp,
} from "@/animations/variants";

import { PageHeader } from "@/components/shared/page-header";

import {
Card,
CardHeader,
CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

import { useAppointmentsList } from "@/features/modo-clinica/hooks/use-appointments-list";

import {
clinicalProceduresRepository,
type ClinicalProcedure,
} from "@/repositories/clinical-procedures.repository";

export default function CasosClinicosPage() {
const router = useRouter();

const {
appointments,
isLoading: appointmentsLoading,
} = useAppointmentsList();

const [procedures, setProcedures] = useState<ClinicalProcedure[]>([]);
const [proceduresLoading, setProceduresLoading] = useState(true);

useEffect(() => {
let cancelled = false;

```
async function loadProcedures() {
  setProceduresLoading(true);

  try {
    const data = await clinicalProceduresRepository.list();

    if (!cancelled) {
      setProcedures(data);
    }
  } catch (error) {
    console.error(
      "Erro ao carregar procedimentos clínicos:",
      error
    );

    if (!cancelled) {
      setProcedures([]);
    }
  } finally {
    if (!cancelled) {
      setProceduresLoading(false);
    }
  }
}

void loadProcedures();

return () => {
  cancelled = true;
};
```

}, []);

function iniciarProcedimento(procedure: ClinicalProcedure) {
router.push(
`/modo-atendimento?procedureId=${encodeURIComponent(
        procedure.id
      )}`
);
}

function continuarAtendimento(appointmentId: string) {
router.push(
`/modo-atendimento?id=${encodeURIComponent(
        appointmentId
      )}`
);
}

return ( <div className="space-y-8">
<PageHeader
title="Casos Clínicos"
description="Escolha um procedimento para iniciar um atendimento ou continue um atendimento já iniciado."
action={
<Button
onClick={() => router.push("/modo-atendimento")}
> <PlayCircle className="mr-2 h-4 w-4" />
Iniciar Atendimento </Button>
}
/>

```
  <section className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold text-text-primary">
        Procedimentos Clínicos
      </h2>

      <p className="text-sm text-text-secondary">
        Selecione um procedimento para carregar automaticamente
        sua revisão, checklist e protocolo clínico.
      </p>
    </div>

    {proceduresLoading ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className="h-44 w-full"
          />
        ))}
      </div>
    ) : procedures.length === 0 ? (
      <Card>
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <ClipboardList className="h-10 w-10 text-text-muted" />

          <div>
            <h3 className="font-medium text-text-primary">
              Nenhum procedimento cadastrado
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Cadastre os protocolos clínicos no Supabase
              para começar.
            </p>
          </div>
        </div>
      </Card>
    ) : (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {procedures.map((procedure) => (
          <motion.div
            key={procedure.id}
            variants={fadeInUp}
          >
            <Card className="h-full transition hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {procedure.nome}
                    </CardTitle>

                    {procedure.disciplina && (
                      <p className="mt-1 text-xs text-text-muted">
                        {procedure.disciplina}
                      </p>
                    )}
                  </div>

                  <Badge variant="primary">
                    Protocolo
                  </Badge>
                </div>

                {procedure.descricao && (
                  <p className="mt-2 text-sm text-text-secondary">
                    {procedure.descricao}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
                  {procedure.checklist.length > 0 && (
                    <span>
                      ✓ {procedure.checklist.length} checklist
                    </span>
                  )}

                  {procedure.passoAPasso.length > 0 && (
                    <span>
                      ✓ {procedure.passoAPasso.length} etapas
                    </span>
                  )}

                  {procedure.materiais.length > 0 && (
                    <span>
                      ✓ {procedure.materiais.length} materiais
                    </span>
                  )}
                </div>

                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    iniciarProcedimento(procedure)
                  }
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Iniciar procedimento
                </Button>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )}
  </section>

  <section className="space-y-4">
    <div>
      <h2 className="text-lg font-semibold text-text-primary">
        Histórico de Atendimentos
      </h2>

      <p className="text-sm text-text-secondary">
        Continue atendimentos em andamento ou consulte os
        que já foram finalizados.
      </p>
    </div>

    {appointmentsLoading ? (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <Skeleton
            key={item}
            className="h-36 w-full"
          />
        ))}
      </div>
    ) : appointments.length === 0 ? (
      <EmptyState
        icon={Stethoscope}
        title="Nenhum atendimento ainda"
        description="Escolha um procedimento acima para iniciar seu primeiro atendimento clínico."
      />
    ) : (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {appointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            variants={fadeInUp}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {appointment.patientName ||
                        "Paciente não selecionado"}
                    </CardTitle>

                    <p className="mt-1 text-sm text-text-secondary">
                      {appointment.procedure ||
                        "Procedimento clínico"}
                    </p>
                  </div>

                  {appointment.status === "FINALIZADO" ? (
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Finalizado
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      Em andamento
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="h-3.5 w-3.5" />

                  {new Date(
                    appointment.startedAt
                  ).toLocaleDateString("pt-BR")}
                </div>

                <div className="mt-4">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      continuarAtendimento(
                        appointment.id
                      )
                    }
                  >
                    {appointment.status === "FINALIZADO"
                      ? "Ver atendimento"
                      : "Continuar atendimento"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )}
  </section>
</div>
```

);
}
