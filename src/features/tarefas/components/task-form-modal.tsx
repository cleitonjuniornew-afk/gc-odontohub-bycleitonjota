"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  taskSchema,
  type TaskFormInput,
} from "../schemas/task-schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { Task } from "@/types";

import { useDisciplines } from "@/features/disciplinas/hooks/use-disciplines";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onSubmit: (
    data: TaskFormInput
  ) => Promise<void> | void;

  submitting?: boolean;

  initialData?: Task | null;

  // NOVO:
  // quando abrir pela página da disciplina
  // já vem preenchido
  disciplineId?: string;
}


export function TaskFormModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initialData,
  disciplineId,
}: Props) {


  const { disciplines } = useDisciplines();


  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskSchema),

    defaultValues: {
      priority: "MEDIA",
      disciplineId: disciplineId ?? "",
    },
  });



  useEffect(() => {

    if (!open) return;


    reset(

      initialData

        ? {
            title: initialData.title,

            description:
              initialData.description ?? "",

            priority:
              initialData.priority,

            dueDate:
              initialData.dueDate ?? "",

            disciplineId:
              initialData.disciplineId ?? "",
          }


        : {

            title: "",

            description: "",

            priority: "MEDIA",

            dueDate: "",

            disciplineId:
              disciplineId ?? "",
          }

    );


  }, [
    open,
    initialData,
    disciplineId,
    reset,
  ]);




  async function submit(
    data: TaskFormInput
  ) {

    await onSubmit(data);

    onOpenChange(false);

  }



  return (

    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent>


        <DialogHeader>

          <DialogTitle>

            {initialData
              ? "Editar tarefa"
              : "Nova tarefa"}

          </DialogTitle>


          <DialogDescription>

            Organize sua rotina acadêmica.

          </DialogDescription>


        </DialogHeader>



        <form
          onSubmit={
            handleSubmit(submit)
          }

          className="space-y-4"
        >



          <div>

            <Label>
              Título
            </Label>


            <Input

              placeholder="Ex: Revisar Endodontia"

              className="mt-1.5"

              {...register("title")}

            />


            {errors.title && (

              <p className="mt-1 text-xs text-error">

                {errors.title.message}

              </p>

            )}

          </div>




          <div>

            <Label>
              Descrição
            </Label>


            <Textarea

              className="mt-1.5 min-h-20"

              {...register("description")}

            />

          </div>




          <div className="grid grid-cols-2 gap-4">


            <div>

              <Label>
                Prioridade
              </Label>


              <Controller

                control={control}

                name="priority"

                render={({ field }) => (

                  <Select

                    value={field.value}

                    onValueChange={
                      field.onChange
                    }

                  >

                    <SelectTrigger className="mt-1.5">

                      <SelectValue />

                    </SelectTrigger>


                    <SelectContent>

                      <SelectItem value="BAIXA">
                        Baixa
                      </SelectItem>


                      <SelectItem value="MEDIA">
                        Média
                      </SelectItem>


                      <SelectItem value="ALTA">
                        Alta
                      </SelectItem>


                    </SelectContent>


                  </Select>

                )}

              />

            </div>




            <div>

              <Label>
                Data
              </Label>


              <Input

                type="date"

                className="mt-1.5"

                {...register("dueDate")}

              />

            </div>


          </div>





          {!disciplineId && (

            <div>

              <Label>
                Disciplina
              </Label>


              <Controller

                control={control}

                name="disciplineId"

                render={({ field }) => (

                  <Select

                    value={field.value}

                    onValueChange={
                      field.onChange
                    }

                  >


                    <SelectTrigger className="mt-1.5">

                      <SelectValue placeholder="Selecione..." />

                    </SelectTrigger>



                    <SelectContent>


                      {disciplines.map((d) => (

                        <SelectItem

                          key={d.id}

                          value={d.id}

                        >

                          {d.name}

                        </SelectItem>

                      ))}


                    </SelectContent>


                  </Select>

                )}

              />


            </div>

          )}





          <div className="flex justify-end gap-3">


            <Button

              type="button"

              variant="ghost"

              onClick={() =>
                onOpenChange(false)
              }

            >

              Cancelar

            </Button>



            <Button

              type="submit"

              loading={submitting}

            >

              {initialData
                ? "Salvar alterações"
                : "Criar tarefa"}

            </Button>


          </div>




        </form>



      </DialogContent>


    </Dialog>

  );

}
