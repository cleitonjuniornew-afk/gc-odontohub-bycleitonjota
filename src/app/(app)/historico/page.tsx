"use client";

import { History } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function HistoricoPage() {
  return (
    <div>
      <PageHeader title="Histórico" description="Linha do tempo de tudo o que você já fez no GC OdontoHub." />
      <EmptyState icon={History} title="Seu histórico vai aparecer aqui" description="Conforme você usa o sistema, cada ação importante fica registrada nesta linha do tempo." />
    </div>
  );
}
