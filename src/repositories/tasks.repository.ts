/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { tasks as seedTasks } from "@/lib/mock-data";
import type { Task } from "@/types";

type LocalRow = Task & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(seedTasks.map((t) => ({ ...t, deletedAt: null })));

function fromRow(row: any): Task {
  return {
    id: row.id,
    title: row.titulo ?? row.title,
    description: row.descricao ?? row.description,
    done: row.concluida ?? row.done ?? false,
    priority: row.prioridade ?? row.priority ?? "MEDIA",
    dueDate: row.data ?? row.dueDate,
    disciplineId: row.disciplina_id ?? row.disciplineId,
    learned: row.aprendizado ?? row.learned,
  };
}

function toRow(input: Partial<Task>) {
  return {
    titulo: input.title,
    descricao: input.description,
    concluida: input.done,
    prioridade: input.priority,
    data: input.dueDate || null,
    disciplina_id: input.disciplineId || null,
    aprendizado: input.learned,
  };
}

export const tasksRepository = {
  async list(): Promise<Task[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("tarefas").select("*").is("deleted_at", null).order("data", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  async create(input: Omit<Task, "id">): Promise<Task> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const {
      data: { user },
    } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("tarefas").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },

  async update(id: string, input: Partial<Task>): Promise<Task> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("tarefas").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },

  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("tarefas").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("tarefas").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
