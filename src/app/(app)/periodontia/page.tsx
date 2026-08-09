"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  Plus,
  Save,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Odontogram } from "./components/odontogram";
import {
  usePeriodontia,
  type PeriodontalExam,
} from "@/features/periodontia/hooks/use-periodontia";

const TOOTH_NUMBERS = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

interface Patient {
  id: string;
  nome?: string;
  name?: string;
}

export default function PeriodontiaPage() {
  const {
    exams,
    isLoading,
    createExam,
    initializeTeeth,
    isCreatingExam,
    isInitializingTeeth,
  } = usePeriodontia();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const [currentExam, setCurrentExam] =
    useState<PeriodontalExam | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patients, patientId]
  );

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoadingPatients(true);

        /*
         * Busca os pacientes já cadastrados no Supabase.
         *
         * Mantemos essa busca isolada aqui para não alterar
         * nenhum módulo já existente da aplicação.
         */
        const response = await fetch("/api/pacientes");

        if (!response.ok) {
          throw new Error("Não foi possível carregar os pacientes.");
        }

        const data = await response.json();

        setPatients(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.patients)
              ? data.patients
              : []
        );
      } catch {
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
  }, []);

  useEffect(() => {
    if (!patientId || exams.length === 0) return;

    const patientExam = exams.find(
      (exam) =>
        exam.patientId === patientId &&
        exam.status === "EM_ANDAMENTO"
    );

    if (patientExam) {
      setCurrentExam(patientExam);
      setExamStarted(true);
    }
  }, [patientId, exams]);

  async function handleStartExam() {
    if (!patientId) {
      return;
    }

    try {
      const exam = await createExam({
        patientId,
        date: new Date().toISOString().slice(0, 10),
      });

      setCurrentExam(exam);
      setExamStarted(true);

      await initializeTeeth({
        examId: exam.id,
        toothNumbers: TOOTH_NUMBERS,
      });
    } catch {
      // O hook já apresenta a mensagem de erro.
    }
  }

  function handleSelectPatient(value: string) {
    setPatientId(value);

    const existingExam = exams.find(
      (exam) =>
        exam.patientId === value &&
        exam.status === "EM_ANDAMENTO"
    );

    if (existingExam) {
      setCurrentExam(existingExam);
      setExamStarted(true);
    } else {
      setCurrentExam(null);
      setExamStarted(false);
    }
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Periodontia"
        description="Exame periodontal completo, odontograma e acompanhamento da saúde periodontal."
        action={
          <div className="flex gap-2">
            {examStarted && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleExportPdf}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            )}

            <Button
              type="button"
              onClick={handleStartExam}
              disabled={
                !patientId ||
                isCreatingExam ||
                isInitializingTeeth
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreatingExam
                ? "Criando..."
                : "Novo exame"}
            </Button>
          </div>
        }
      />

      {/* RESUMO */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserRound className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-muted">
                Paciente
              </p>

              {!examStarted ? (
                <select
                  value={patientId}
                  onChange={(event) =>
                    handleSelectPatient(event.target.value)
                  }
                  disabled={loadingPatients}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="">
                    {loadingPatients
                      ? "Carregando..."
                      : "Selecione um paciente"}
                  </option>

                  {patients.map((patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.nome ??
                        patient.name ??
                        "Paciente sem nome"}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="truncate text-sm font-semibold text-text-primary">
                  {selectedPatient?.nome ??
                    selectedPatient?.name ??
                    "Paciente selecionado"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Data do exame
              </p>

              <p className="text-sm font-semibold text-text-primary">
                {currentExam
                  ? new Date(
                      `${currentExam.date}T00:00:00`
                    ).toLocaleDateString("pt-BR")
                  : new Date().toLocaleDateString(
                      "pt-BR"
                    )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Status
              </p>

              <Badge
                variant={
                  examStarted
                    ? "success"
                    : "secondary"
                }
              >
                {examStarted
                  ? "Em andamento"
                  : "Aguardando exame"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Exame periodontal
              </p>

              <p className="text-sm font-semibold text-text-primary">
                32 dentes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ODONTOGRAMA */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>

            <div>
              <CardTitle>
                Odontograma
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Selecione um dente para iniciar a
                avaliação periodontal.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Odontogram />
        </CardContent>
      </Card>

      {/* PERIODONTOGRAMA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                Periodontograma
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Registro clínico dos seis sítios
                periodontais de cada dente.
              </p>
            </div>

            <Badge
              variant={
                examStarted
                  ? "success"
                  : "secondary"
              }
            >
              {examStarted
                ? "Exame ativo"
                : "Aguardando início"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!examStarted ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-base font-semibold text-text-primary">
                Selecione um paciente
              </h3>

              <p className="mt-2 max-w-lg text-sm text-text-secondary">
                Escolha um paciente já cadastrado
                em Pacientes e clique em{" "}
                <strong>Novo exame</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium text-text-primary">
                      Exame periodontal em andamento
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Selecione um dente no odontograma
                      para registrar os seis sítios
                      periodontais, sangramento,
                      placa, supuração, mobilidade e
                      furca.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-text-muted">
                    Profundidade de sondagem
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    —
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-text-muted">
                    Recessão gengival
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    —
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-text-muted">
                    Nível de inserção clínica
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    —
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-text-muted">
                    Sangramento
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    —
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-text-primary">
                  Seis sítios periodontais
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  Vestibular: mesiovestibular,
                  vestibular central e
                  distovestibular. Lingual/palatino:
                  mesiolingual, lingual/palatino central
                  e distolingual/palatino.
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!currentExam}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Dados salvos automaticamente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
