"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  disciplineId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  completed: boolean;
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
      <p>
        Carregando tarefas...
      </p>
    );

  }


  return (

    <div className="space-y-4">


      <div className="flex justify-between items-center">

        <h3 className="font-semibold">
          Tarefas da disciplina
        </h3>


        <Button>
          Nova tarefa
        </Button>

      </div>



      {
        tasks.length === 0 ? (

          <div className="rounded-lg border p-6">

            <p className="text-sm text-text-secondary">
              Nenhuma tarefa vinculada a esta disciplina.
            </p>

          </div>


        ) : (


          <div className="space-y-3">

            {tasks.map((task)=>(

              <div
                key={task.id}
                className="rounded-lg border p-4"
              >

                <p className="font-medium">
                  {task.title}
                </p>

                <p className="text-sm text-text-secondary">
                  Prioridade: {task.priority}
                </p>


              </div>

            ))}

          </div>

        )
      }


    </div>

  );
}
