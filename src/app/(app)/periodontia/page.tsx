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
  FileText,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";

import Odontogram from "./components/odontogram";

import { usePatients } from "@/features/pacientes/hooks/use-patients";

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

const LAST_DATE_KEY =
  "gc-odontohub-periodontia-last-date";

function getTodayInputDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastUsedDate() {
  if (typeof window === "undefined") {
    return getTodayInputDate();
  }

  const saved =
    localStorage.getItem(LAST_DATE_KEY);

  if (!saved) {
    return getTodayInputDate();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(saved)) {
    return saved;
  }

  return getTodayInputDate();
}

function formatDateBR(value?: string | null) {
  if (!value) return "—";

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    const [, year, month, day] = match;

    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR");
}

export default function PeriodontiaPage() {
  const {
    patients,
    isLoading: isLoadingPatients,
  } = usePatients();

  const {
    exams,
    createExam,
    updateExam,
    initializeTeeth,
    isCreatingExam,
    isInitializingTeeth,
    isUpdatingExam,
  } = usePeriodontia();

  const [patientId, setPatientId] =
    useState("");

  const [examStarted, setExamStarted] =
    useState(false);

  const [currentExam, setCurrentExam] =
    useState<PeriodontalExam | null>(null);

  const [examDate, setExamDate] =
    useState(getLastUsedDate);

  const [odontogramKey, setOdontogramKey] =
    useState(0);

  const selectedPatient = useMemo(
    () =>
      patients.find(
        (patient) => patient.id === patientId
      ),
    [patients, patientId]
  );

  useEffect(() => {
    if (!patientId) {
      setCurrentExam(null);
      setExamStarted(false);
      return;
    }

    const existingExam = exams.find(
      (exam) =>
        exam.patientId === patientId &&
        exam.status === "EM_ANDAMENTO"
    );

    if (existingExam) {
      setCurrentExam(existingExam);
      setExamStarted(true);

      if (existingExam.date) {
        const normalizedDate = String(
          existingExam.date
        ).slice(0, 10);

        if (
          /^\d{4}-\d{2}-\d{2}$/.test(
            normalizedDate
          )
        ) {
          setExamDate(normalizedDate);

          localStorage.setItem(
            LAST_DATE_KEY,
            normalizedDate
          );
        }
      }
    } else {
      setCurrentExam(null);
      setExamStarted(false);
      setExamDate(getLastUsedDate());
    }
  }, [patientId, exams]);

  async function handleStartExam() {
    if (!patientId) return;

    try {
      const date =
        examDate || getLastUsedDate();

      localStorage.setItem(
        LAST_DATE_KEY,
        date
      );

      const exam = await createExam({
        patientId,
        date,
      });

      setCurrentExam(exam);
      setExamStarted(true);
      setExamDate(date);

      await initializeTeeth({
        examId: exam.id,
        toothNumbers: TOOTH_NUMBERS,
      });

      setOdontogramKey(
        (current) => current + 1
      );
    } catch {
      // O hook já exibe a mensagem de erro.
    }
  }

  async function handleChangeExamDate(
    value: string
  ) {
    if (!value) return;

    setExamDate(value);

    localStorage.setItem(
      LAST_DATE_KEY,
      value
    );

    if (!currentExam?.id) {
      return;
    }

    try {
      const updatedExam =
        await updateExam({
          id: currentExam.id,
          input: {
            date: value,
          },
        });

      setCurrentExam((current) =>
        current
          ? {
              ...current,
              ...updatedExam,
            }
          : current
      );
    } catch (error) {
      console.error(
        "ERRO AO ATUALIZAR DATA DO EXAME:",
        error
      );
    }
  }

  function handleSelectPatient(
    value: string
  ) {
    setPatientId(value);

    if (!value) {
      setCurrentExam(null);
      setExamStarted(false);
      setExamDate(getLastUsedDate());
      return;
    }

    const existingExam = exams.find(
      (exam) =>
        exam.patientId === value &&
        exam.status === "EM_ANDAMENTO"
    );

    if (existingExam) {
      setCurrentExam(existingExam);
      setExamStarted(true);

      if (existingExam.date) {
        const normalizedDate = String(
          existingExam.date
        ).slice(0, 10);

        if (
          /^\d{4}-\d{2}-\d{2}$/.test(
            normalizedDate
          )
        ) {
          setExamDate(normalizedDate);

          localStorage.setItem(
            LAST_DATE_KEY,
            normalizedDate
          );
        }
      }
    } else {
      setCurrentExam(null);
      setExamStarted(false);
      setExamDate(getLastUsedDate());
    }
  }

  function handleChangePatient() {
    setPatientId("");
    setCurrentExam(null);
    setExamStarted(false);
    setExamDate(getLastUsedDate());
  }

  function handleExportPdf() {
    window.print();
  }

  const patientName =
    selectedPatient?.name ?? "Paciente";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Periodontia"
        description="Exame periodontal completo, odontograma e acompanhamento da saúde periodontal."
        action={
          <div className="flex items-center gap-2">
            {examStarted && (
              <Button
                type="button"
                variant="outline"
                onClick={handleExportPdf}
              >
                Exportar PDF
              </Button>
            )}

            {examStarted && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleChangePatient}
              >
                Trocar paciente
              </Button>
            )}

            {!examStarted && patientId && (
              <Button
                type="button"
                onClick={handleStartExam}
                disabled={
                  isCreatingExam ||
                  isInitializingTeeth
                }
              >
                <Plus className="mr-2 h-4 w-4" />

                {isCreatingExam
                  ? "Criando..."
                  : isInitializingTeeth
                    ? "Preparando dentes..."
                    : "Novo exame"}
              </Button>
            )}
          </div>
        }
      />

      {!examStarted && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>

              <div>
                <CardTitle>
                  Selecione o paciente
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Escolha o paciente e a data
                  para iniciar o exame
                  periodontal.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid max-w-3xl gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Paciente
                </label>

                <select
                  value={patientId}
                  onChange={(event) =>
                    handleSelectPatient(
                      event.target.value
                    )
                  }
                  disabled={isLoadingPatients}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                >
                  <option value="">
                    {isLoadingPatients
                      ? "Carregando pacientes..."
                      : "Selecione um paciente"}
                  </option>

                  {patients.map((patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.name}
                      {patient.phone
                        ? ` — ${patient.phone}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Data do exame
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />

                  <input
                    type="date"
                    value={examDate}
                    onChange={(event) =>
                      handleChangeExamDate(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <p className="mt-2 text-xs text-text-muted">
                  Última data utilizada:{" "}
                  <strong>
                    {formatDateBR(examDate)}
                  </strong>
                </p>
              </div>
            </div>

            {!isLoadingPatients &&
              patients.length === 0 && (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-4">
                  <p className="text-sm font-medium text-text-primary">
                    Nenhum paciente
                    cadastrado
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    Cadastre o paciente
                    primeiro na área de
                    Pacientes.
                  </p>
                </div>
              )}

            {patientId && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium text-text-primary">
                      {patientName}
                    </p>

                    {selectedPatient?.phone && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {selectedPatient.phone}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-text-secondary">
                      Data selecionada:{" "}
                      <strong>
                        {formatDateBR(
                          examDate
                        )}
                      </strong>
                    </p>

                    <p className="mt-2 text-sm text-text-secondary">
                      Agora clique em{" "}
                      <strong>Novo exame</strong>{" "}
                      para iniciar o
                      periodontograma deste
                      paciente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {examStarted && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-text-muted">
                    Paciente
                  </p>

                  <p className="truncate text-sm font-semibold text-text-primary">
                    {patientName}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-muted">
                      Data do exame
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {formatDateBR(
                        examDate
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(event) =>
                      handleChangeExamDate(
                        event.target.value
                      )
                    }
                    disabled={isUpdatingExam}
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {isUpdatingExam && (
                    <p className="mt-1 text-[11px] text-text-muted">
                      Salvando data...
                    </p>
                  )}
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

                  <Badge variant="success">
                    Em andamento
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

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <CardTitle>
                    Odontograma periodontal
                  </CardTitle>

                  <p className="mt-1 text-sm text-text-secondary">
                    Registro periodontal
                    completo dos dentes e
                    sítios periodontais.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Odontogram
                key={odontogramKey}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Periodontograma
                  </CardTitle>

                  <p className="mt-1 text-sm text-text-secondary">
                    Registro clínico dos seis
                    sítios periodontais de cada
                    dente.
                  </p>
                </div>

                <Badge variant="success">
                  Exame ativo
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium text-text-primary">
                      Exame periodontal de{" "}
                      {patientName}
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Os dados registrados no
                      periodontograma pertencem
                      exclusivamente a este
                      paciente e a este exame.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

              <div className="mt-4 rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Seis sítios por dente
                    </p>

                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      Vestibular:
                      mesiovestibular,
                      vestibular central e
                      distovestibular.
                      Lingual/palatino:
                      mesiolingual,
                      lingual/palatino central
                      e distolingual/palatino.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
