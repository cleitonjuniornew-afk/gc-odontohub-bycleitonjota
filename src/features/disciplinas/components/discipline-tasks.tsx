"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Props {
  disciplineId: string;
}

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  prioridade: string | null;
  data: string | null;
  disciplina_id: string;
}

export function DisciplineTasks({ disciplineId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase
        .from("tarefas")
        .select(
          "id, titulo, descricao, concluida, prioridade, data, disciplina_id"
        )
        .eq("disciplina_id", disciplineId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar tarefas:", error);
        return;
      }

      setTasks((data ?? []) as Task[]);
    } catch (error) {
      console.error("Erro inesperado ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [disciplineId]);

  async function addTask() {
    if (!titulo.trim()) {
      return;
    }

    try {
      setSaving(true);

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const { data, error } = await supabase
        .from("tarefas")
        .insert({
          user_id: user.id,
          titulo: titulo.trim(),
          descricao: descricao.trim() || null,
          concluida: false,
          prioridade: "MEDIA",
          data: null,
          disciplina_id: disciplineId,
        })
        .select(
          "id, titulo, descricao, concluida, prioridade, data, disciplina_id"
        )
        .single();

      if (error) {
        console.error("Erro ao salvar tarefa:", error);
        alert(`Não foi possível salvar a tarefa: ${error.message}`);
        return;
      }

      if (data) {
        setTasks((old) => [data as Task, ...old]);
      }

      setTitulo("");
      setDescricao("");
      setOpen(false);
    } catch (error) {
      console.error("Erro inesperado ao salvar tarefa:", error);
      alert("Ocorreu um erro ao salvar a tarefa.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    const supabase = createClient();

    const { error } = await supabase
      .from("tarefas")
      .update({
        concluida: !task.concluida,
      })
      .eq("id", task.id);

    if (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return;
    }

    setTasks((old) =>
      old.map((item) =>
        item.id === task.id
          ? { ...item, concluida: !item.concluida }
          : item
      )
    );
  }

  if (loading) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Carregando tarefas...
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tarefas da disciplina</h2>
          <p className="text-sm text-muted-foreground">
            Organize as atividades desta disciplina.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>+ Nova tarefa</Button>
      </div>

      {open && (
        <Card className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>

            <Input
              placeholder="Ex: Estudar instrumentais de Endodontia"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>

            <Textarea
              placeholder="Descreva o que precisa ser feito..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setTitulo("");
                setDescricao("");
              }}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={addTask}
              disabled={saving || !titulo.trim()}
            >
              {saving ? "Salvando..." : "Salvar tarefa"}
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
              className={`p-4 ${
                task.concluida ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.concluida}
                  onChange={() => toggleTask(task)}
                  className="mt-1 h-4 w-4"
                />

                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-semibold ${
                      task.concluida
                        ? "line-through"
                        : ""
                    }`}
                  >
                    {task.titulo}
                  </h3>

                  {task.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.descricao}
                    </p>
                  )}

                  {task.prioridade && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Prioridade: {task.prioridade}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
