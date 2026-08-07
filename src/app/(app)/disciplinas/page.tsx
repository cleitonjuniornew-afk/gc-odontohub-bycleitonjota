import { PageHeader } from "@/components/shared/page-header";
import { DisciplineGrid } from "@/features/disciplinas/components/discipline-grid";

export default function DisciplinasPage() {
  return (
    <div>
      <PageHeader title="Disciplinas" description="Todo o conteúdo acadêmico organizado por matéria." />
      <DisciplineGrid />
    </div>
  );
}
