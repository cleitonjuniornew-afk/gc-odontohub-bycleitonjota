"use client";

import { Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function FlashcardsPage() {
  return (
    <div>
      <PageHeader title="Flashcards" description="Revisão espaçada e inteligente." />
      <ComingSoon
        icon={Layers}
        title="Flashcards inteligentes chegando em breve"
        description="Gerados automaticamente a partir dos seus resumos e materiais, com repetição espaçada."
        features={["Criação manual de flashcards", "Geração automática via IA", "Repetição espaçada", "Estatísticas de revisão"]}
      />
    </div>
  );
}
