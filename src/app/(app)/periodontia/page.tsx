"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Odontogram } from "./components/odontogram";

export default function PeriodontiaPage() {
  const [examStarted, setExamStarted] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Periodontia"
        description="Exame periodontal completo, odontograma e acompanhamento da saúde periodontal."
        action={
          <Button
            type="button"
            onClick={() => setExamStarted(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo exame
          </Button>
        }
      />

      {/* RESUMO DO EXAME */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <UserRound className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs text-text-muted">Paciente</p>
              <p className="text-sm font-semibold text-text-primary">
                {examStarted ? "Selecione um paciente" : "Nenhum selecionado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-xs text-text-muted">Data do exame</p>
              <p className="text-sm font-semibold text-text-primary">
                {new Date().toLocaleDateString("pt-BR")}
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
              <p className="text-xs text-text-muted">Status</p>
              <Badge variant={examStarted ? "success" : "secondary"}>
                {examStarted ? "Em andamento" : "Aguardando exame"}
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
              <p className="text-xs text-text-muted">Exame periodontal</p>
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
              <CardTitle>Odontograma</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Selecione um dente para iniciar o exame periodontal.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Odontogram />
        </CardContent>
      </Card>

      {/* ÁREA DO PERIODONTOGRAMA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Periodontograma</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Registro clínico dos sítios periodontais.
              </p>
            </div>

            <Badge variant="secondary">
              {examStarted ? "Exame ativo" : "Aguardando início"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {!examStarted ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-7 w-7 text-primary" />
              </div>

              <h3 className="text-base font-semibold text-text-primary">
                Comece um novo exame
              </h3>

              <p className="mt-2 max-w-lg text-sm text-text-secondary">
                Clique em <strong>Novo exame</strong> para iniciar o
                atendimento e depois selecione os dentes para registrar
                sondagem, sangramento, recessão gengival, nível de inserção
                clínica, mobilidade e furca.
              </p>

              <Button
                type="button"
                className="mt-5"
                onClick={() => setExamStarted(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Iniciar exame
              </Button>
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
                      Selecione um dente no odontograma acima para começar a
                      registrar os dados periodontais.
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
