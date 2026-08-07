import { PageHeader } from "@/components/shared/page-header";
import { StatsPanel } from "@/features/estatisticas/components/stats-panel";

export default function EstatisticasPage() {
  return (
    <div>
      <PageHeader title="Estatísticas" description="Sua evolução acadêmica em números e gráficos." />
      <StatsPanel />
    </div>
  );
}
