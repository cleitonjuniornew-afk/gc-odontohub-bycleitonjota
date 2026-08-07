/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";

export interface Objective {
  id: string;
  title: string;
  type: "diario" | "semanal" | "mensal" | "semestral";
  target: number;
  progress: number;
  dueDate?: string;
}

type LocalRow = Objective & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>([
  { id: "w1", title: "Horas estudadas", type: "semanal", target: 12, progress: 7, deletedAt: null },
  { id: "w2", title: "Resumos concluídos", type: "semanal", target: 5, progress: 3, deletedAt: null },
  { id: "w3", title: "Revisar Endodontia", type: "semanal", target: 1, progress: 0, deletedAt: null },
]);

function fromRow(row: any): Objective {
  return {
    id: row.id,
    title: row.titulo ?? row.title,
    type: row.tipo ?? row.type,
    target: Number(row.meta_total ?? row.target),
    progress: Number(row.progresso ?? row.progress),
    dueDate: row.prazo ?? row.dueDate,
  };
}

function toRow(input: Partial<Objective>) {
  return {
    titulo: input.title,
    tipo: input.type,
    meta_total: input.target,
    progresso: input.progress,
    prazo: input.dueDate || null,
  };
}

export const objectivesRepository = {
  async list(): Promise<Objective[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("objetivos").select("*").is("deleted_at", null);
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async create(input: Omit<Objective, "id">): Promise<Objective> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const { data: { user } } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("objetivos").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async update(id: string, input: Partial<Objective>): Promise<Objective> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("objetivos").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("objetivos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("objetivos").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
