"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope } from "lucide-react";
import { Odontogram } from "./components/odontogram";

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
              <CardTitle>Odontograma</CardTitle>
              <p className="mt-1 text-sm text-text-secondary">
                Selecione os dentes para registrar as condições clínicas.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Odontogram />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exame Periodontal</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            O periodontograma completo será integrado a este exame.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Stethoscope className="h-7 w-7 text-primary" />
            </div>

            <h3 className="text-base font-semibold text-text-primary">
              Periodontograma
            </h3>

            <p className="mt-2 max-w-md text-sm text-text-secondary">
              Aqui vamos adicionar a sondagem periodontal, sangramento à
              sondagem, recessão gengival, nível de inserção clínica,
              mobilidade, furca e demais informações do exame.
            </p>

            <Badge variant="secondary" className="mt-4">
              Próxima etapa
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
