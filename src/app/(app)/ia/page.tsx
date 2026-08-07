"use client";

import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function IaPage() {
  return (
    <div>
      <PageHeader title="IA" description="Seu assistente acadêmico inteligente." />
      <ComingSoon
        icon={Sparkles}
        title="A IA do GC OdontoHub está a caminho"
        description="Em breve você poderá conversar, gerar resumos, flashcards e questões, além de analisar PDFs, slides e radiografias."
        features={[
          "Chat IA — tire dúvidas a qualquer hora",
          "Resumo inteligente de PDFs e slides",
          "Geração automática de flashcards e questões",
          "Correção de resumos",
          "Assistente clínico para procedimentos",
          "Organizador automático de materiais",
        ]}
      />
    </div>
  );
}
