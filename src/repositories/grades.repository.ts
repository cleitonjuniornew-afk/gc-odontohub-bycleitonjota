/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { grades as seedGrades } from "@/lib/mock-data";
import type { Grade } from "@/types";

type LocalRow = Grade & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(seedGrades.map((g) => ({ ...g, deletedAt: null })));

function fromRow(row: any): Grade {
  return {
    id: row.id,
    disciplineId: row.disciplina_id ?? row.disciplineId,
    name: row.nome ?? row.name,
    weight: Number(row.peso ?? row.weight),
    maxValue: Number(row.valor ?? row.maxValue),
    score: row.nota !== null && row.nota !== undefined ? Number(row.nota) : row.score,
    date: row.data ?? row.date,
  };
}

function toRow(input: Partial<Grade>) {
  return {
    disciplina_id: input.disciplineId,
    nome: input.name,
    peso: input.weight,
    valor: input.maxValue,
    nota: input.score ?? null,
    data: input.date || null,
  };
}

export const gradesRepository = {
  async list(): Promise<Grade[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("avaliacoes").select("*").is("deleted_at", null);
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async create(input: Omit<Grade, "id">): Promise<Grade> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const { data: { user } } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("avaliacoes").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async update(id: string, input: Partial<Grade>): Promise<Grade> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("avaliacoes").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("avaliacoes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("avaliacoes").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
