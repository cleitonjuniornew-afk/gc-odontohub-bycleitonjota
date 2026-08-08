"use client";

import { useState } from "react";
import { UploadCloud, FileCheck2 } from "lucide-react";
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
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

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
  ) => Promise<unknown>;
  submitting?: boolean;
}

interface Discipline {
  id: string;
  name: string;
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
  const [loadingDisciplines, setLoadingDisciplines] = useState(false);

  async function loadDisciplines() {
    if (disciplines.length > 0) return;

    setLoadingDisciplines(true);

    try {
      const supabase = createClient();

      const {
        data,
        error,
      } = await supabase
        .from("disciplinas")
        .select("id, nome")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar disciplinas:", error);
        return;
      }

      setDisciplines(
        (data ?? []).map((discipline) => ({
          id: discipline.id,
          name: discipline.nome,
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    } finally {
      setLoadingDisciplines(false);
    }
  }

  async function handleSubmit() {
    if (!file) return;

    await onSubmit(file, {
      description: description || undefined,
      phase,
      disciplineId: disciplineId || undefined,
    });

    setFile(null);
    setDescription("");
    setPhase("depois");
    setDisciplineId("");
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    if (value) {
      loadDisciplines();
    }

    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar foto</DialogTitle>

          <DialogDescription>
            Organize por disciplina, fase e descrição.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="photo-file">Arquivo</Label>

            <label
              htmlFor="photo-file"
              className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-colors hover:bg-card"
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
                    : "Clique para selecionar uma imagem"}
                </p>

                <p className="text-xs text-text-muted">
                  JPG, PNG, WEBP ou outra imagem
                </p>
              </div>
            </label>

            {!isSupabaseConfigured && (
              <p className="mt-2 text-xs text-text-muted">
                Modo demonstração: a imagem fica disponível apenas nesta
                sessão.
              </p>
            )}

            <input
              id="photo-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>

            <Input
              id="description"
              className="mt-1.5"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
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
                    value as "antes" | "durante" | "depois"
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
                disabled={loadingDisciplines}
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
                    disciplines.map((discipline) => (
                      <SelectItem
                        key={discipline.id}
                        value={discipline.id}
                      >
                        {discipline.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!file || submitting}
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
