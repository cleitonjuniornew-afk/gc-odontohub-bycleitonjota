import { PageHeader } from "@/components/shared/page-header";
import { TaskList } from "@/features/tarefas/components/task-list";

export default function PlanejamentoPage() {
  return (
    <div>
      <PageHeader
        title="Planejamento"
        description="Suas tarefas diárias, semanais e mensais em um só lugar."
      />
      <TaskList />
    </div>
  );
}
