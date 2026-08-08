"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope } from "lucide-react";

export default function PeriodontiaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Periodontia"
        description="Exame periodontal completo, odontograma e acompanhamento da saúde periodontal."
        action={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo exame
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>

            <div>
              <CardTitle>Exame Periodontal</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Selecione um paciente para iniciar o exame.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              Nenhum exame periodontal selecionado
            </h3>

            <p className="mt-2 max-w-md text-sm text-text-secondary">
              Em breve você poderá selecionar o paciente e realizar o
              odontograma e o periodontograma completo diretamente aqui.
            </p>

            <Badge variant="secondary" className="mt-4">
              Módulo em construção
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
