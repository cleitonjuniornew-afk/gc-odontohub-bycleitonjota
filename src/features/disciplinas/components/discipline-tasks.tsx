"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TaskFormModal } from "@/features/tasks/components/task-form-modal";
import type { TaskFormInput } from "@/features/tasks/schemas/task-schema";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

interface Props {
  disciplineId: string;
}

export function DisciplineTasks({
  disciplineId,
}: Props) {

  const {
    tasks,
    createTask,
    loading,
  } = useTasks();


  const [open, setOpen] = useState(false);


  const disciplineTasks = tasks.filter(
    (task) => task.disciplineId === disciplineId
  );


  async function handleCreate(
    data: TaskFormInput
  ) {

    await createTask({
      ...data,
      disciplineId,
    });

    setOpen(false);

  }


  return (

    <div className="space-y-4">


      <div className="flex justify-between items-center">

        <h2 className="text-lg font-semibold">
          Tarefas da disciplina
        </h2>


        <Button
          onClick={() => setOpen(true)}
        >

          <Plus className="mr-2 h-4 w-4"/>

          Nova tarefa

        </Button>


      </div>



      {disciplineTasks.length === 0 && (

        <Card className="p-6 text-center">

          <p className="text-sm text-text-secondary">
            Nenhuma tarefa cadastrada nesta disciplina.
          </p>

        </Card>

      )}



      {disciplineTasks.map((task)=> (

        <Card
          key={task.id}
          className="p-4"
        >

          <h3 className="font-medium">
            {task.title}
          </h3>


          {task.description && (

            <p className="text-sm text-text-secondary mt-2">
              {task.description}
            </p>

          )}

        </Card>

      ))}



      <TaskFormModal

        open={open}

        onOpenChange={setOpen}

        onSubmit={handleCreate}

        submitting={loading}

      />


    </div>

  );

}
