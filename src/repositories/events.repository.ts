/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { events as seedEvents } from "@/lib/mock-data";
import type { AgendaEvent } from "@/types";

type LocalRow = AgendaEvent & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(seedEvents.map((e) => ({ ...e, deletedAt: null })));

function fromRow(row: any): AgendaEvent {
  return {
    id: row.id,
    title: row.titulo ?? row.title,
    type: row.tipo ?? row.type,
    color: row.cor ?? row.color,
    start: row.inicio ?? row.start,
    end: row.fim ?? row.end,
    disciplineId: row.disciplina_id ?? row.disciplineId,
  };
}

function toRow(input: Partial<AgendaEvent>) {
  return {
    titulo: input.title,
    tipo: input.type,
    cor: input.color,
    inicio: input.start,
    fim: input.end || null,
    disciplina_id: input.disciplineId || null,
  };
}

export const eventsRepository = {
  async list(): Promise<AgendaEvent[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("eventos").select("*").is("deleted_at", null).order("inicio");
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async create(input: Omit<AgendaEvent, "id">): Promise<AgendaEvent> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const { data: { user } } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("eventos").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async update(id: string, input: Partial<AgendaEvent>): Promise<AgendaEvent> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("eventos").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("eventos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("eventos").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
