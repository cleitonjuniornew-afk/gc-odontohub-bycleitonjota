"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  done?: boolean;
}

interface Props {
  tasks?: Task[];
  onCreate?: () => void;
}

export function DisciplineTasks({
  tasks = [],
  onCreate,
}: Props) {
  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Tarefas da disciplina
        </h2>

        <Button onClick={onCreate}>
          Nova tarefa
        </Button>
      </div>


      {tasks.length === 0 ? (

        <Card className="p-6 text-center">

          <p className="text-sm text-text-secondary">
            Nenhuma tarefa cadastrada para esta disciplina.
          </p>

          <Button
            className="mt-4"
            onClick={onCreate}
          >
            Criar primeira tarefa
          </Button>

        </Card>

      ) : (

        <div className="space-y-3">

          {tasks.map((task) => (

            <Card
              key={task.id}
              className="p-4"
            >

              <h3 className="font-medium text-text-primary">
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1 text-sm text-text-secondary">
                  {task.description}
                </p>
              )}

            </Card>

          ))}

        </div>

      )}

    </div>
  );
}
