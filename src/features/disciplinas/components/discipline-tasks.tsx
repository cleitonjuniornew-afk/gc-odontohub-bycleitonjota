"use client";

interface Props {
  disciplineId: string;
}

export function DisciplineTasks({
  disciplineId,
}: Props) {

  return (
    <div className="space-y-4">

      <div className="rounded-lg border p-6">

        <h3 className="font-semibold text-text-primary">
          Tarefas da disciplina
        </h3>

        <p className="mt-2 text-sm text-text-secondary">
          Nenhuma tarefa cadastrada para esta disciplina.
        </p>

        <p className="mt-2 text-xs text-text-secondary">
          Disciplina ID: {disciplineId}
        </p>

      </div>

    </div>
  );
}
