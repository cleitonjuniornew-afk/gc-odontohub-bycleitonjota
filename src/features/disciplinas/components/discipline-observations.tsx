"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createClient } from "@/lib/supabase/client";

interface Props {
  disciplineId: string;
}

interface Observation {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
}

export function DisciplineObservations({
  disciplineId,
}: Props) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [open, setOpen] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const supabase = createClient();

  const loadObservations = useCallback(async () => {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("observacoes")
      .select("id, titulo, conteudo, created_at")
      .eq("disciplina_id", disciplineId)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Erro ao carregar observações:",
        error
      );

      setObservations([]);
      setLoading(false);
      return;
    }

    setObservations(data ?? []);
    setLoading(false);
  }, [disciplineId, supabase]);

  useEffect(() => {
    loadObservations();
  }, [loadObservations]);

  async function addObservation() {
    if (!titulo.trim() || !conteudo.trim()) {
      return;
    }

    setSaving(true);

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa estar logado para adicionar uma observação.");
      setSaving(false);
      return;
    }

    const {
      error,
    } = await supabase
      .from("observacoes")
      .insert({
        user_id: user.id,
        disciplina_id: disciplineId,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
      });

    if (error) {
      console.error(
        "Erro ao salvar observação:",
        error
      );

      alert(
        "Não foi possível salvar a observação."
      );

      setSaving(false);
      return;
    }

    setTitulo("");
    setConteudo("");
    setOpen(false);

    await loadObservations();

    setSaving(false);
  }

  async function deleteObservation(id: string) {
    const confirmed = window.confirm(
      "Deseja excluir esta observação?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(id);

    const {
      error,
    } = await supabase
      .from("observacoes")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao excluir observação:",
        error
      );

      alert(
        "Não foi possível excluir a observação."
      );

      setDeleting(null);
      return;
    }

    await loadObservations();

    setDeleting(null);
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-4">

        <div>
          <h2 className="text-lg font-semibold">
            Observações
          </h2>

          <p className="text-sm text-muted-foreground">
            Registre informações importantes desta disciplina.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar observação
        </Button>

      </div>

      {open && (
        <Card className="space-y-4 p-4">

          <div>
            <label className="text-sm font-medium">
              Título
            </label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Observação sobre prova"
              value={titulo}
              onChange={(event) =>
                setTitulo(event.target.value)
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Observação
            </label>

            <Textarea
              className="mt-1.5 min-h-28"
              placeholder="Digite sua observação..."
              value={conteudo}
              onChange={(event) =>
                setConteudo(event.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-2">

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setTitulo("");
                setConteudo("");
              }}
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={addObservation}
              disabled={
                saving ||
                !titulo.trim() ||
                !conteudo.trim()
              }
            >
              {saving
                ? "Salvando..."
                : "Salvar observação"}
            </Button>

          </div>

        </Card>
      )}

      {loading ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Carregando observações...
        </Card>
      ) : observations.length === 0 ? (
        <Card className="p-6 text-center">

          <p className="text-sm text-muted-foreground">
            Nenhuma observação cadastrada nesta disciplina.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar primeira observação
          </Button>

        </Card>
      ) : (
        <div className="space-y-3">

          {observations.map((observation) => (
            <Card
              key={observation.id}
              className="p-4"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <h3 className="font-semibold">
                    {observation.titulo}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {observation.conteudo}
                  </p>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(
                      observation.created_at
                    ).toLocaleDateString("pt-BR")}
                  </p>

                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    deleteObservation(
                      observation.id
                    )
                  }
                  disabled={
                    deleting === observation.id
                  }
                  title="Excluir observação"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

              </div>

            </Card>
          ))}

        </div>
      )}

    </div>
  );
}
