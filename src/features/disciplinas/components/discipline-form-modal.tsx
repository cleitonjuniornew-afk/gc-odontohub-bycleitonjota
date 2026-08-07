"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { disciplinesRepository } from "@/repositories/disciplines.repository";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

interface DisciplineFormData {
  name: string;
  professor: string;
  sala: string;
  dia_aula: string;
  horario: string;
  descricao: string;
  color: string;
}

export function DisciplineFormModal({
  open,
  onOpenChange,
  onCreated,
}: Props) {

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<DisciplineFormData>({
    defaultValues: {
      color: "#00BFFF",
    },
  });


  async function submit(data: DisciplineFormData) {

    await disciplinesRepository.create({
      name: data.name,
      professor: data.professor,
      sala: data.sala,
      color: data.color,
      dia_aula: data.dia_aula,
      horario: data.horario,
      descricao: data.descricao,
    });


    reset();
    onOpenChange(false);

    if (onCreated) {
      onCreated();
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            Nova disciplina
          </DialogTitle>

          <DialogDescription>
            Cadastre todas as informações da disciplina.
          </DialogDescription>

        </DialogHeader>


        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-4"
        >


          <div>
            <Label>
              Nome da disciplina
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Endodontia 1"
              {...register("name")}
            />
          </div>


          <div>
            <Label>
              Professor
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Dr. João"
              {...register("professor")}
            />
          </div>


          <div>
            <Label>
              Sala
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Clínica 2"
              {...register("sala")}
            />
          </div>


          <div>
            <Label>
              Dia da aula
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Terça e Quinta"
              {...register("dia_aula")}
            />
          </div>


          <div>
            <Label>
              Horário
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Ex: 13:30 às 17:30"
              {...register("horario")}
            />
          </div>


          <div>
            <Label>
              Descrição
            </Label>

            <Input
              className="mt-1.5"
              placeholder="Informações da disciplina"
              {...register("descricao")}
            />
          </div>


          <div>
            <Label>
              Cor
            </Label>

            <Input
              type="color"
              className="mt-1.5 h-10"
              {...register("color")}
            />
          </div>


          <div className="flex justify-end gap-3">

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>


            <Button type="submit">
              Criar disciplina
            </Button>

          </div>


        </form>

      </DialogContent>

    </Dialog>
  );
}
