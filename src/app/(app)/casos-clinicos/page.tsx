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
      `/modo-atendimento?id=${encodeURIComponent(
        appointmentId
      )}`
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
      `Tem certeza que deseja excluir o procedimento ${procedure.nome}?\n\nO procedimento será removido da lista de Procedimentos Clínicos.`
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

  /*
   * Mostra somente procedimentos que possuem checklist.
   * Isso deixa a página compacta e mantém apenas o que
   * realmente pode ser usado como protocolo clínico.
   */
  const proceduresWithChecklist = procedures.filter(
    (procedure) =>
      Array.isArray(procedure.checklist) &&
      procedure.checklist.length > 0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Casos Clínicos"
        description="Escolha um procedimento para iniciar um atendimento ou continue um atendimento já iniciado."
        action={
          <Button
            onClick={() =>
              router.push("/modo-atendimento")
            }
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Iniciar Atendimento
          </Button>
        }
      />

      {/* PROCEDIMENTOS CLÍNICOS */}
      <section className="min-w-0 w-full space-y-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">
            Procedimentos Clínicos
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Procedimentos com checklist disponíveis para
            iniciar um atendimento.
          </p>
        </div>

        {proceduresLoading ? (
          <Card className="overflow-hidden">
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton
                  key={item}
                  className="h-12 w-full"
                />
              ))}
            </div>
          </Card>
        ) : proceduresWithChecklist.length === 0 ? (
          <Card className="overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <ClipboardList className="h-8 w-8 text-text-muted" />

              <div>
                <h3 className="font-medium text-text-primary">
                  Nenhum procedimento disponível
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Cadastre procedimentos com checklist
                  para utilizá-los nos atendimentos.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface"
          >
            {proceduresWithChecklist.map(
              (procedure, index) => (
                <motion.div
                  key={procedure.id}
                  variants={fadeInUp}
                  className={`flex min-w-0 items-center gap-3 px-4 py-3 ${
                    index !==
                    proceduresWithChecklist.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      iniciarProcedimento(procedure)
                    }
                    className="min-w-0 flex-1 text-left transition-colors hover:text-primary"
                  >
                    <div className="truncate text-sm font-medium text-text-primary">
                      {procedure.nome}
                    </div>

                    {procedure.disciplina && (
                      <div className="mt-0.5 truncate text-xs text-text-muted">
                        {procedure.disciplina}
                      </div>
                    )}
                  </button>

                  <Badge
                    variant="primary"
                    className="hidden shrink-0 whitespace-nowrap sm:flex"
                  >
                    Checklist
                  </Badge>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      iniciarProcedimento(procedure)
                    }
                    className="shrink-0"
                  >
                    <PlayCircle className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">
                      Iniciar
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
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
                    aria-label={`Excluir ${procedure.nome}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </section>

      {/* HISTÓRICO */}
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
                        ).toLocaleDateString(
                          "pt-BR"
                        )}
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
