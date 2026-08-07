"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { TaskFormModal } from "@/features/planejamento/components/task-form-modal";

interface Props {
  disciplineId: string;
  disciplineName: string;
}


export function DisciplineTasks({
  disciplineId,
  disciplineName,
}: Props) {

  const [open, setOpen] = useState(false);


  async function createTask(data: any) {

    console.log(
      "CRIANDO TAREFA DA DISCIPLINA:",
      disciplineId,
      data
    );

    // aqui vamos ligar ao Supabase na próxima etapa

  }


  return (

    <div className="space-y-4">


      <div className="flex items-center justify-between">


        <div>

          <h3 className="text-lg font-semibold">
            Tarefas
          </h3>

          <p className="text-sm text-text-secondary">
            {disciplineName}
          </p>

        </div>



        <Button
          onClick={() => setOpen(true)}
        >

          <Plus className="mr-2 h-4 w-4" />

          Nova tarefa

        </Button>


      </div>




      <Card className="p-6 text-center">


        <p className="text-sm text-text-secondary">

          Nenhuma tarefa cadastrada para esta disciplina.

        </p>


      </Card>





      <TaskFormModal

        open={open}

        onOpenChange={setOpen}

        onSubmit={createTask}

        disciplineId={disciplineId}

      />


    </div>

  );

}
