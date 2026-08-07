/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";

export interface Reminder {
  id: string;
  title: string;
  category?: string;
  recurring: boolean;
  date?: string;
}

type LocalRow = Reminder & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>([]);

function fromRow(row: any): Reminder {
  return {
    id: row.id,
    title: row.titulo ?? row.title,
    category: row.categoria ?? row.category,
    recurring: row.recorrente ?? row.recurring ?? false,
    date: row.data ?? row.date,
  };
}

function toRow(input: Partial<Reminder>) {
  return {
    titulo: input.title,
    categoria: input.category || null,
    recorrente: input.recurring ?? false,
    data: input.date || null,
  };
}

export const remindersRepository = {
  async list(): Promise<Reminder[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("lembretes").select("*").is("deleted_at", null);
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async create(input: Omit<Reminder, "id">): Promise<Reminder> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const { data: { user } } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("lembretes").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async update(id: string, input: Partial<Reminder>): Promise<Reminder> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("lembretes").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("lembretes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("lembretes").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
