"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, StickyNote } from "lucide-react";

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
  disciplina_id: string;
  titulo: string | null;
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

  async function loadObservations() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("observacoes")
      .select("*")
      .eq("disciplina_id", disciplineId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar observações:", error);
      setObservations([]);
    } else {
      setObservations(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadObservations();
  }, [disciplineId]);

  async function addObservation() {
    if (!conteudo.trim()) {
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa estar logado para cadastrar uma observação.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("observacoes")
      .insert({
        user_id: user.id,
        disciplina_id: disciplineId,
        titulo: titulo.trim() || null,
        conteudo: conteudo.trim(),
      });

    if (error) {
      console.error("Erro ao salvar observação:", error);
      alert(`Não foi possível salvar a observação: ${error.message}`);
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
      "Tem certeza que deseja excluir esta observação?"
    );

    if (!confirmed) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("observacoes")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir observação:", error);
      alert(`Não foi possível excluir: ${error.message}`);
      return;
    }

    await loadObservations();
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-3">

        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Observações
          </h2>

          <p className="text-sm text-text-secondary">
            Registre informações importantes sobre esta disciplina.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova observação
        </Button>

      </div>

      {open && (
        <Card className="p-5">

          <div className="space-y-4">

            <div>
              <label
                htmlFor="observation-title"
                className="text-sm font-medium text-text-primary"
              >
                Título
              </label>

              <Input
                id="observation-title"
                className="mt-1.5"
                placeholder="Ex: Conteúdo importante para a prova"
                value={titulo}
                onChange={(event) =>
                  setTitulo(event.target.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor="observation-content"
                className="text-sm font-medium text-text-primary"
              >
                Observação
              </label>

              <Textarea
                id="observation-content"
                className="mt-1.5 min-h-28"
                placeholder="Escreva sua observação..."
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
                variant="primary"
                onClick={addObservation}
                disabled={saving || !conteudo.trim()}
              >
                {saving ? "Salvando..." : "Salvar observação"}
              </Button>

            </div>

          </div>

        </Card>
      )}

      {loading ? (
        <Card className="p-6 text-center text-sm text-text-secondary">
          Carregando observações...
        </Card>
      ) : observations.length === 0 ? (
        <Card className="p-8 text-center">

          <StickyNote className="mx-auto h-8 w-8 text-text-muted" />

          <p className="mt-3 text-sm font-medium text-text-primary">
            Nenhuma observação cadastrada.
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            Clique em "Nova observação" para adicionar a primeira.
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar observação
          </Button>

        </Card>
      ) : (
        <div className="space-y-3">

          {observations.map((observation) => (
            <Card
              key={observation.id}
              className="p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1">

                  {observation.titulo && (
                    <h3 className="font-semibold text-text-primary">
                      {observation.titulo}
                    </h3>
                  )}

                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">
                    {observation.conteudo}
                  </p>

                  <p className="mt-3 text-xs text-text-muted">
                    {new Date(
                      observation.created_at
                    ).toLocaleDateString("pt-BR")}
                  </p>

                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    deleteObservation(observation.id)
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
