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
}

interface DisciplineFormData {
  name: string;
  professor: string;
  color: string;
}

export function DisciplineFormModal({
  open,
  onOpenChange,
}: Props) {

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<DisciplineFormData>();


  async function submit(data: DisciplineFormData) {

    await disciplinesRepository.create({
      name: data.name,
      professor: data.professor,
      color: data.color,
    });

    reset();
    onOpenChange(false);

    window.location.reload();
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Nova disciplina
          </DialogTitle>

          <DialogDescription>
            Cadastre uma disciplina do seu curso.
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
              Cor
            </Label>

            <Input
              type="color"
              className="mt-1.5 h-10"
              defaultValue="#00BFFF"
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
