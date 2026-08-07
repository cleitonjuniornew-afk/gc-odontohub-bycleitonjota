import { PageHeader } from "@/components/shared/page-header";
import { GradesPanel } from "@/features/notas/components/grades-panel";

export default function NotasPage() {
  return (
    <div>
      <PageHeader
        title="Notas"
        description="Média, situação e quanto falta para a aprovação — calculado automaticamente."
      />
      <GradesPanel />
    </div>
  );
}
