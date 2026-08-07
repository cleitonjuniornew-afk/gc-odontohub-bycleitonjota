"use client";

import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function ConquistasPage() {
  return (
    <div>
      <PageHeader title="Conquistas" description="Sua evolução acadêmica, reconhecida." />
      <ComingSoon
        icon={Trophy}
        title="Sistema de conquistas e XP em desenvolvimento"
        description="Ganhe XP, suba de nível e desbloqueie conquistas por cada ação de estudo, clínica e organização."
        features={["Primeiro resumo", "7 dias estudando", "30 dias estudando", "100 flashcards", "Primeiro paciente", "100 tarefas concluídas"]}
      />
    </div>
  );
}
