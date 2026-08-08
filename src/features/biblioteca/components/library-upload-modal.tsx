"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, FileCheck2 } from "lucide-react";

import {
  libraryItemSchema,
  type LibraryItemFormInput,
} from "../schemas/library-schema";

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

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useDisciplines } from "@/features/disciplinas/hooks/use-disciplines";

import { isSupabaseConfigured } from "@/lib/supabase/env";

import type { LibraryItem } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onSubmit: (
    data: Omit<LibraryItem, "id" | "date">,
    file?: File
  ) => Promise<void> | void;

  submitting?: boolean;
}

export function LibraryUploadModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const {
    disciplines,
    isLoading: disciplinesLoading,
  } = useDisciplines();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibraryItemFormInput>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: {
      title: "",
      type: "PDF",
      disciplineId: "",
      professor: "",
      subject: "",
    },
  });

  async function submit(data: LibraryItemFormInput) {
    await onSubmit(data, file ?? undefined);

    reset({
      title: "",
      type: "PDF",
      disciplineId: "",
      professor: "",
      subject: "",
    });

    setFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar material</DialogTitle>

          <DialogDescription>
            PDFs, slides e vídeos ficam disponíveis para organização por
            disciplina.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          {/* ARQUIVO */}
          <div>
            <Label htmlFor="file">
              Arquivo
            </Label>

            <label
              htmlFor="file"
              className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 transition hover:bg-card"
            >
              {file ? (
                <FileCheck2 className="h-5 w-5 text-primary" />
              ) : (
                <UploadCloud className="h-5 w-5 text-text-muted" />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {file
                    ? file.name
                    : "Clique para selecionar um arquivo"}
                </p>

                <p className="text-xs text-text-muted">
                  PDF, slide, documento ou vídeo
                </p>
              </div>
            </label>

            <input
              id="file"
              type="file"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
            />

            {!isSupabaseConfigured && (
              <p className="mt-2 text-xs text-text-muted">
                Modo demonstração: o arquivo não será enviado
                para um servidor real.
              </p>
            )}
          </div>

          {/* TÍTULO */}
          <div>
            <Label htmlFor="title">
              Título
            </Label>

            <Input
              id="title"
              placeholder="Ex: Slides — Anatomia Dentária"
              className="mt-1.5"
              {...register("title")}
            />

            {errors.title && (
              <p className="mt-1 text-xs text-error">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* TIPO + DISCIPLINA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Tipo
              </Label>

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="PDF">
                        PDF
                      </SelectItem>

                      <SelectItem value="SLIDE">
                        Slide
                      </SelectItem>

                      <SelectItem value="VIDEO">
                        Vídeo
                      </SelectItem>

                      <SelectItem value="DOCUMENTO">
                        Documento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

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
                    onValueChange={field.onChange}
                    disabled={disciplinesLoading}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue
                        placeholder={
                          disciplinesLoading
                            ? "Carregando..."
                            : "Selecione..."
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {disciplines.map((discipline) => (
                        <SelectItem
                          key={discipline.id}
                          value={discipline.id}
                        >
                          {discipline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectContent>
                )}
              />
            </div>
          </div>

          {/* PROFESSOR + ASSUNTO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professor">
                Professor
              </Label>

              <Input
                id="professor"
                className="mt-1.5"
                placeholder="Nome do professor"
                {...register("professor")}
              />
            </div>

            <div>
              <Label htmlFor="subject">
                Assunto
              </Label>

              <Input
                id="subject"
                className="mt-1.5"
                placeholder="Ex: Anatomia dental"
                {...register("subject")}
              />
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              Adicionar material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
