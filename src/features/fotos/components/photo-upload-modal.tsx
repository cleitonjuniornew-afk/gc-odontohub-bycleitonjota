"use client";

import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileCheck2,
} from "lucide-react";

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

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface Discipline {
  id: string;
  nome: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onSubmit: (
    file: File,
    meta: {
      description?: string;
      phase?: "antes" | "durante" | "depois";
      disciplineId?: string;
    }
  ) => Promise<void>;

  submitting?: boolean;
}

export function PhotoUploadModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const [description, setDescription] = useState("");

  const [phase, setPhase] =
    useState<"antes" | "durante" | "depois">("depois");

  const [disciplineId, setDisciplineId] = useState("");

  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  const [loadingDisciplines, setLoadingDisciplines] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadDisciplines() {
      setLoadingDisciplines(true);

      try {
        if (!isSupabaseConfigured) {
          setDisciplines([]);
          return;
        }

        const supabase = createClient();

        const {
          data,
          error,
        } = await supabase
          .from("disciplinas")
          .select("id, nome")
          .order("nome", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Erro ao carregar disciplinas:",
            error
          );
          return;
        }

        setDisciplines(data ?? []);
      } catch (error) {
        console.error(
          "Erro ao carregar disciplinas:",
          error
        );
      } finally {
        setLoadingDisciplines(false);
      }
    }

    loadDisciplines();
  }, [open]);

  async function handleSubmit() {
    if (!file) return;

    await onSubmit(file, {
      description:
        description.trim() || undefined,

      phase,

      disciplineId:
        disciplineId || undefined,
    });

    setFile(null);
    setDescription("");
    setPhase("depois");
    setDisciplineId("");

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
            Adicionar foto
          </DialogTitle>

          <DialogDescription>
            Organize suas fotos por disciplina,
            fase e descrição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label
            htmlFor="photo-file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center hover:bg-card"
          >
            {file ? (
              <FileCheck2 className="mb-2 h-8 w-8 text-primary" />
            ) : (
              <UploadCloud className="mb-2 h-8 w-8 text-text-muted" />
            )}

            <span className="text-sm font-medium">
              {file
                ? file.name
                : "Clique para selecionar uma imagem"}
            </span>

            <span className="mt-1 text-xs text-text-muted">
              PNG, JPG ou WEBP
            </span>
          </label>

          {!isSupabaseConfigured && (
            <p className="text-xs text-text-muted">
              Modo demonstração: a imagem fica
              disponível apenas nesta sessão.
            </p>
          )}

          <input
            id="photo-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ?? null
              );
            }}
          />

          <div>
            <Label htmlFor="description">
              Descrição
            </Label>

            <Input
              id="description"
              className="mt-1.5"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Ex: Caso de restauração classe II"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fase</Label>

              <Select
                value={phase}
                onValueChange={(value) =>
                  setPhase(
                    value as
                      | "antes"
                      | "durante"
                      | "depois"
                  )
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="antes">
                    Antes
                  </SelectItem>

                  <SelectItem value="durante">
                    Durante
                  </SelectItem>

                  <SelectItem value="depois">
                    Depois
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Disciplina</Label>

              <Select
                value={disciplineId}
                onValueChange={setDisciplineId}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue
                    placeholder={
                      loadingDisciplines
                        ? "Carregando..."
                        : "Selecione..."
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {disciplines.length === 0 ? (
                    <SelectItem
                      value="none"
                      disabled
                    >
                      Nenhuma disciplina cadastrada
                    </SelectItem>
                  ) : (
                    disciplines.map(
                      (discipline) => (
                        <SelectItem
                          key={discipline.id}
                          value={discipline.id}
                        >
                          {discipline.nome}
                        </SelectItem>
                      )
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

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
              type="button"
              onClick={handleSubmit}
              disabled={
                !file ||
                submitting
              }
              loading={submitting}
            >
              Adicionar foto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
