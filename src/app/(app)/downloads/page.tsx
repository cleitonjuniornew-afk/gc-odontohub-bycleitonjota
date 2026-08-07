"use client";

import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function DownloadsPage() {
  return (
    <div>
      <PageHeader title="Downloads" description="Arquivos exportados e baixados do sistema." />
      <EmptyState icon={Download} title="Nada por aqui ainda" description="Seus arquivos exportados (relatórios, backups, resumos) aparecerão aqui." />
    </div>
  );
}
