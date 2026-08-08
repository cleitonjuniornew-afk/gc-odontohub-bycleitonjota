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

  const [procedures, setProcedures] = useState<
    ClinicalProcedure[]
  >([]);

  const [proceduresLoading, setProceduresLoading] =
    useState(true);

  const [deletingAppointmentId, setDeletingAppointmentId] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProcedures() {
      setProceduresLoading(true);

      try {
        const data =
          await clinicalProceduresRepository.list();

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

  function iniciarProcedimento(
    procedure: ClinicalProcedure
  ) {
    router.push(
      `/modo-atendimento?procedureId=${encodeURIComponent(
        procedure.id
      )}`
    );
  }

  function continuarAtendimento(
    appointmentId: string
  ) {
    router.push(
      `/modo-atendimento?id=${encodeURIComponent(
        appointmentId
      )}`
    );
  }

  async function excluirAtendimento(
    appointmentId: string
  ) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este atendimento?\n\nEssa ação irá removê-lo do histórico."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAppointmentId(appointmentId);

      await appointmentsRepository.delete(
        appointmentId
      );

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

  return (
    <div className="min-w-0 w-full space-y-8 overflow-hidden">
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
      <section className="min-w-0 w-full space-y-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">
            Procedimentos Clínicos
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Selecione o procedimento para carregar
            automaticamente sua revisão, checklist e
            protocolo clínico.
          </p>
        </div>

        {proceduresLoading ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                className="h-56 w-full"
              />
            ))}
          </div>
        ) : procedures.length === 0 ? (
          <Card className="min-w-0 overflow-hidden">
            <div className="flex min-w-0 flex-col items-center justify-center gap-3 p-8 text-center">
              <ClipboardList className="h-10 w-10 shrink-0 text-text-muted" />

              <div className="min-w-0 max-w-full">
                <h3 className="font-medium text-text-primary">
                  Nenhum procedimento cadastrado
                </h3>

                <p className="mt-1 text-sm text-text-secondary">
                  Cadastre os protocolos clínicos no
                  Supabase para começar.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {procedures.map((procedure) => (
              <motion.div
                key={procedure.id}
                variants={fadeInUp}
                className="min-w-0 w-full"
              >
                <Card className="flex h-full min-w-0 w-full flex-col overflow-hidden">
                  <CardHeader className="flex min-w-0 w-full flex-1 flex-col p-5">
                    {/* CABEÇALHO DO PROCEDIMENTO */}
                    <div className="flex min-w-0 w-full items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="block w-full min-w-0 break-words text-base leading-snug">
                          {procedure.nome}
                        </CardTitle>

                        {procedure.disciplina && (
                          <p className="mt-1 w-full min-w-0 break-words text-xs text-text-muted">
                            {procedure.disciplina}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant="primary"
                        className="shrink-0 whitespace-nowrap"
                      >
                        Protocolo
                      </Badge>
                    </div>

                    {/* DESCRIÇÃO */}
                    {procedure.descricao && (
                      <p className="mt-3 w-full min-w-0 break-words text-sm leading-relaxed text-text-secondary">
                        {procedure.descricao}
                      </p>
                    )}

                    {/* INFORMAÇÕES */}
                    <div className="mt-4 flex min-w-0 w-full flex-wrap gap-x-3 gap-y-2 text-xs text-text-muted">
                      {procedure.checklist.length > 0 && (
                        <span className="whitespace-nowrap">
                          ✓ {procedure.checklist.length} checklist
                        </span>
                      )}

                      {procedure.passoAPasso.length > 0 && (
                        <span className="whitespace-nowrap">
                          ✓ {procedure.passoAPasso.length} etapas
                        </span>
                      )}

                      {procedure.materiais.length > 0 && (
                        <span className="whitespace-nowrap">
                          ✓ {procedure.materiais.length} materiais
                        </span>
                      )}
                    </div>

                    {/* BOTÃO */}
                    <div className="mt-auto pt-5">
                      <Button
                        className="w-full"
                        onClick={() =>
                          iniciarProcedimento(
                            procedure
                          )
                        }
                      >
                        <PlayCircle className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Iniciar procedimento
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
                    {/* CABEÇALHO */}
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

                    {/* DATA */}
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

                    {/* BOTÕES */}
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
