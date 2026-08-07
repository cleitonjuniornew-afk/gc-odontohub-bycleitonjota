/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { patients as seedPatients } from "@/lib/mock-data";
import type { Patient } from "@/types";

type LocalRow = Patient & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(
  seedPatients.map((p) => ({ ...p, deletedAt: null }))
);

function fromRow(row: any): Patient {
  return {
    id: row.id,
    name: row.nome ?? row.name,
    age: row.idade ?? row.age,
    professor: row.professor,
    procedures: row.procedimentos ?? row.procedures ?? [],
    nextReturn: row.proximo_retorno ?? row.nextReturn,
    notes: row.observacoes ?? row.notes,
    phone: row.telefone ?? row.phone,
    birthDate: row.nascimento ?? row.birthDate,
  };
}

function toRow(input: Partial<Patient>) {
  return {
    nome: input.name,
    telefone: input.phone || null,
    nascimento: input.birthDate || null,
    idade: input.age ?? null,
    professor: input.professor || null,
    procedimentos: input.procedures ?? [],
    proximo_retorno: input.nextReturn || null,
    observacoes: input.notes || null,
  };
}

export const patientsRepository = {
  async list(): Promise<Patient[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("pacientes").select("*").is("deleted_at", null).order("nome");
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },
  async create(input: Omit<Patient, "id">): Promise<Patient> {
    if (!isSupabaseConfigured) return localStore.create(input as LocalRow);
    const { data: { user } } = await createClient().auth.getUser();
    const { data, error } = await createClient().from("pacientes").insert({ ...toRow(input), user_id: user?.id }).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async update(id: string, input: Partial<Patient>): Promise<Patient> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("pacientes").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const { error } = await createClient().from("pacientes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },
  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("pacientes").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
