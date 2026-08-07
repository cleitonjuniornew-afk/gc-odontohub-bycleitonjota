"use client";

import { DatabaseBackup } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/shared/coming-soon";

export default function BackupPage() {
  return (
    <div>
      <PageHeader title="Backup" description="Segurança e continuidade dos seus dados." />
      <ComingSoon
        icon={DatabaseBackup}
        title="Backup automático em breve"
        description="Seus dados serão sincronizados e protegidos automaticamente na nuvem."
        features={["Backup automático diário", "Restauração com um clique", "Histórico de versões", "Sincronização entre dispositivos"]}
      />
    </div>
  );
}
