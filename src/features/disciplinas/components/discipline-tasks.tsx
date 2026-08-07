"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  disciplineId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
}

export function DisciplineTasks({
  disciplineId,
}: Props) {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");


  function addTask() {

    if (!title.trim()) return;


    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
    };


    setTasks((old) => [
      ...old,
      newTask,
    ]);


    setTitle("");
    setDescription("");
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
          + Nova tarefa
        </Button>

      </div>



      {open && (

        <Card className="space-y-3 p-4">

          <Input
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          <Textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />


          <div className="flex gap-2">

            <Button
              onClick={addTask}
            >
              Salvar
            </Button>


            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

          </div>

        </Card>

      )}



      {tasks.length === 0 ? (

        <Card className="p-6 text-center text-sm text-muted-foreground">

          Nenhuma tarefa cadastrada nesta disciplina.

        </Card>

      ) : (

        <div className="space-y-3">

          {tasks.map((task) => (

            <Card
              key={task.id}
              className="p-4"
            >

              <h3 className="font-semibold">
                {task.title}
              </h3>


              {task.description && (

                <p className="text-sm text-muted-foreground mt-1">
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
