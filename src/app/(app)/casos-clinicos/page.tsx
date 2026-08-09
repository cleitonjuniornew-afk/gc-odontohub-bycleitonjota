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
  Trash2,
  Search,
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

import {
  useAppointmentsList,
} from "@/features/modo-clinica/hooks/use-appointments-list";

import {
  clinicalProceduresRepository,
  type ClinicalProcedure,
} from "@/repositories/clinical-procedures.repository";

import {
  appointmentsRepository,
} from "@/repositories/appointments.repository";

export default function CasosClinicosPage() {
  const router = useRouter();

  const {
    appointments,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useAppointmentsList();

  const [procedures, setProcedures] = useState<ClinicalProcedure[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingAppointmentId, setDeletingAppointmentId] =
    useState<string | null>(null);
  const [deletingProcedureId, setDeletingProcedureId] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

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
      `/modo-atendimento?id=${encodeURIComponent(appointmentId)}`
    );
  }

  async function excluirAtendimento(appointmentId: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este atendimento?\n\nEssa ação irá removê-lo do histórico."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAppointmentId(appointmentId);

      await appointmentsRepository.delete(appointmentId);

      await refetchAppointments();
    } catch (error) {
      console.error(
        "Erro ao excluir atendimento:",
        error
      );

      window.alert(
        "Não foi possível excluir o atendimento."
      );
    } finally {
      setDeletingAppointmentId(null);
    }
  }

  async function excluirProcedimento(
    procedure: ClinicalProcedure
  ) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o procedimento "${procedure.nome}"?\n\nO procedimento será removido da lista de Procedimentos Clínicos.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProcedureId(procedure.id);

      await clinicalProceduresRepository.delete(
        procedure.id
      );

      setProcedures((current) =>
        current.filter(
          (item) => item.id !== procedure.id
        )
      );
    } catch (error) {
      console.error(
        "Erro ao excluir procedimento clínico:",
        error
      );

      window.alert(
        "Não foi possível excluir o procedimento clínico."
      );
    } finally {
      setDeletingProcedureId(null);
    }
  }

  const proceduresWithChecklist = procedures.filter(
    (procedure) =>
      Array.isArray(procedure.checklist) &&
      procedure.checklist.length > 0
  );

  const filteredProcedures = proceduresWithChecklist.filter(
    (procedure) => {
      const search = searchTerm.trim().toLowerCase();

      if (!search) {
        return true;
      }

      const nome = procedure.nome?.toLowerCase() ?? "";
      const disciplina =
        procedure.disciplina?.toLowerCase() ?? "";

      return (
        nome.includes(search) ||
        disciplina.includes(search)
      );
    }
  );

  return (
    <div className="min-w-0 w-full space-y-8">
      <PageHeader
        title="Casos Clínicos"
        description="Escolha um procedimento para iniciar um atendimento ou continue um atendimento já iniciado."
        action={
          <Button
            onClick={() => router.push("/modo-atendimento")}
          >
            Iniciar Atendimento
          </Button>
        }
      />

      <section className="min-w-0 w-full space-y-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">
            Procedimentos com Checklist
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Selecione um procedimento para iniciar
            seu checklist clínico.
          </p>
        </div>

        {!proceduresLoading &&
          proceduresWithChecklist.length > 0 && (
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar procedimento..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>
          )}

        {proceduresLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                className="h-14 w-full"
              />
            ))}
          </div>
        ) : proceduresWithChecklist.length === 0 ? (
          <Card className="min-w-0 overflow-hidden">
            <div className="flex min-w-0 flex-col items-center justify-center gap-3 p-8 text-center">
              <ClipboardList className="h-10 w-10 shrink-0 text-text-muted" />

              <div className="min-w-0 max-w-full">
                <h3 className="font-medium text-text-primary">
                  Nenhum checklist cadastrado
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Cadastre procedimentos com checklist
                  para utilizá-los durante os
                  atendimentos.
                </p>
              </div>
            </div>
          </Card>
        ) : filteredProcedures.length === 0 ? (
          <Card className="min-w-0 overflow-hidden">
            <div className="p-6 text-center">
              <p className="text-sm text-text-secondary">
                Nenhum procedimento encontrado para "
                {searchTerm}".
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {filteredProcedures.map((procedure) => (
              <motion.div
                key={procedure.id}
                variants={fadeInUp}
                className="min-w-0 w-full"
              >
                <Card className="min-w-0 w-full overflow-hidden">
                  <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <CardTitle className="block min-w-0 break-words text-sm font-medium leading-snug">
                          {procedure.nome}
                        </CardTitle>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          {procedure.disciplina && (
                            <span>
                              {procedure.disciplina}
                            </span>
                          )}

                          <span>
                            • {procedure.checklist.length}{" "}
                            {procedure.checklist.length === 1
                              ? "item"
                              : "itens"}{" "}
                            no checklist
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="primary"
                        className="hidden shrink-0 whitespace-nowrap sm:flex"
                      >
                        Checklist
                      </Badge>
                    </div>

                    <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                      <Button
                        className="flex-1 sm:flex-none"
                        onClick={() =>
                          iniciarProcedimento(procedure)
                        }
                      >
                        <PlayCircle className="mr-2 h-4 w-4 shrink-0" />

                        <span>Iniciar</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="shrink-0"
                        disabled={
                          deletingProcedureId ===
                          procedure.id
                        }
                        onClick={() =>
                          void excluirProcedimento(
                            procedure
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />

                        <span className="sr-only">
                          {deletingProcedureId ===
                          procedure.id
                            ? "Excluindo procedimento"
                            : `Excluir ${procedure.nome}`}
                        </span>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="min-w-0 w-full space-y-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">
            Histórico de Atendimentos
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Continue atendimentos em andamento ou
            consulte os que já foram finalizados.
          </p>
        </div>

        {appointmentsLoading ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <Skeleton
                key={item}
                className="h-44 w-full"
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
            className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2"
          >
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                variants={fadeInUp}
                className="min-w-0 w-full"
              >
                <Card className="flex h-full min-w-0 w-full flex-col overflow-hidden">
                  <CardHeader className="flex min-w-0 w-full flex-1 flex-col p-5">
                    <div className="flex min-w-0 w-full items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="block w-full min-w-0 break-words text-base leading-snug">
                          {appointment.patientName ||
                            "Paciente não selecionado"}
                        </CardTitle>

                        <p className="mt-1 w-full min-w-0 break-words text-sm leading-snug text-text-secondary">
                          {appointment.procedure ||
                            "Procedimento clínico"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {appointment.status ===
                        "FINALIZADO" ? (
                          <Badge
                            variant="success"
                            className="whitespace-nowrap"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Finalizado
                          </Badge>
                        ) : (
                          <Badge
                            variant="warning"
                            className="whitespace-nowrap"
                          >
                            Em andamento
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {new Date(
                          appointment.startedAt
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-1 gap-2 pt-5 sm:grid-cols-[1fr_auto]">
                      <Button
                        variant="secondary"
                        className="w-full min-w-0"
                        onClick={() =>
                          continuarAtendimento(
                            appointment.id
                          )
                        }
                      >
                        <span className="truncate">
                          {appointment.status ===
                          "FINALIZADO"
                            ? "Ver atendimento"
                            : "Continuar atendimento"}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto"
                        disabled={
                          deletingAppointmentId ===
                          appointment.id
                        }
                        onClick={() =>
                          void excluirAtendimento(
                            appointment.id
                          )
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4 shrink-0" />

                        <span>
                          {deletingAppointmentId ===
                          appointment.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </span>
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
  );
}
