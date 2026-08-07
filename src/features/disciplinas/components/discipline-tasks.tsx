"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  disciplineId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  completed?: boolean | null;
}

export function DisciplineTasks({
  disciplineId,
}: Props) {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);


  async function loadTasks() {

    try {

      const response = await fetch(
        `/api/tasks?disciplineId=${disciplineId}`
      );


      if (!response.ok) {
        throw new Error("Erro ao carregar tarefas");
      }


      const data = await response.json();

      setTasks(data);


    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadTasks();

  }, [disciplineId]);



  if (loading) {

    return (
      <Card className="p-6">
        Carregando tarefas...
      </Card>
    );

  }



  return (

    <div className="space-y-4">


      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-lg font-semibold">
            Tarefas da disciplina
          </h3>

          <p className="text-sm text-text-secondary">
            Tarefas vinculadas a esta matéria.
          </p>

        </div>


        <Button>
          + Nova tarefa
        </Button>

      </div>




      {tasks.length === 0 ? (

        <Card className="p-6">

          <p className="text-sm text-text-secondary">
            Nenhuma tarefa cadastrada nesta disciplina.
          </p>

        </Card>


      ) : (


        <div className="space-y-3">

          {tasks.map((task) => (

            <Card
              key={task.id}
              className="p-4"
            >

              <h4 className="font-medium">
                {task.title}
              </h4>


              {task.description && (

                <p className="mt-2 text-sm text-text-secondary">
                  {task.description}
                </p>

              )}


              <div className="mt-3 flex gap-4 text-xs">

                {task.priority && (
                  <span>
                    Prioridade: {task.priority}
                  </span>
                )}


                {task.dueDate && (
                  <span>
                    Data: {task.dueDate}
                  </span>
                )}

              </div>


            </Card>

          ))}

        </div>

      )}


    </div>

  );

}
