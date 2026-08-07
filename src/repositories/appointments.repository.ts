/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import type { Appointment } from "@/types";

type LocalRow = Appointment & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>([]);

function fromRow(row: any): Appointment {
  return {
    id: row.id,
    patientId: row.paciente_id ?? row.patientId,
    patientName: row.paciente_nome ?? row.patientName ?? "Paciente não selecionado",
    patientAge: row.paciente_idade ?? row.patientAge,
    discipline: row.disciplina ?? row.discipline ?? "",
    professor: row.professor ?? "",
    procedure: row.procedimento ?? row.procedure ?? "",
    status: row.status ?? "EM_ANDAMENTO",
    startedAt: row.iniciado_em ?? row.startedAt ?? new Date().toISOString(),
    finishedAt: row.finalizado_em ?? row.finishedAt,
    checklist: row.checklist ?? [],
    materials: row.materiais ?? row.materials ?? [],
    clinicalNotes: row.anotacoes_clinicas ?? row.clinicalNotes ?? "",
    complications: row.complicacoes ?? row.complications,
    professorObservations: row.observacoes_professor ?? row.professorObservations,
    pendencies: row.pendencias,
    returnDate: row.retorno_data ?? row.returnDate,
    returnNotes: row.retorno_obs ?? row.returnNotes,
    timeline: row.timeline ?? [],
    resumoComoFoi: row.resumo_como_foi,
    resumoAprendizado: row.resumo_aprendizado,
    resumoFariaDiferente: row.resumo_faria_diferente,
    resumoDificuldade: row.resumo_dificuldade,
  };
}

function toRow(input: Partial<Appointment>) {
  const row: Record<string, unknown> = {};
  if (input.patientId !== undefined) row.paciente_id = input.patientId || null;
  if (input.discipline !== undefined) row.disciplina = input.discipline;
  if (input.professor !== undefined) row.professor = input.professor;
  if (input.procedure !== undefined) row.procedimento = input.procedure;
  if (input.status !== undefined) row.status = input.status;
  if (input.finishedAt !== undefined) row.finalizado_em = input.finishedAt;
  if (input.checklist !== undefined) row.checklist = input.checklist;
  if (input.materials !== undefined) row.materiais = input.materials;
  if (input.clinicalNotes !== undefined) row.anotacoes_clinicas = input.clinicalNotes;
  if (input.complications !== undefined) row.complicacoes = input.complications;
  if (input.professorObservations !== undefined) row.observacoes_professor = input.professorObservations;
  if (input.pendencies !== undefined) row.pendencias = input.pendencies;
  if (input.returnDate !== undefined) row.retorno_data = input.returnDate || null;
  if (input.returnNotes !== undefined) row.retorno_obs = input.returnNotes;
  if (input.timeline !== undefined) row.timeline = input.timeline;
  if (input.resumoComoFoi !== undefined) row.resumo_como_foi = input.resumoComoFoi;
  if (input.resumoAprendizado !== undefined) row.resumo_aprendizado = input.resumoAprendizado;
  if (input.resumoFariaDiferente !== undefined) row.resumo_faria_diferente = input.resumoFariaDiferente;
  if (input.resumoDificuldade !== undefined) row.resumo_dificuldade = input.resumoDificuldade;
  return row;
}

export const appointmentsRepository = {
  async list(): Promise<Appointment[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("atendimentos").select("*").is("deleted_at", null).order("iniciado_em", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  async get(id: string): Promise<Appointment | null> {
    if (!isSupabaseConfigured) {
      const all = await localStore.list();
      return all.find((a) => a.id === id) ?? null;
    }
    const { data, error } = await createClient().from("atendimentos").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : null;
  },

  async create(input: Partial<Appointment>): Promise<Appointment> {
    if (!isSupabaseConfigured) {
      return localStore.create({
        patientName: "Paciente não selecionado",
        discipline: "",
        professor: "",
        procedure: "Restauração Classe II",
        status: "EM_ANDAMENTO",
        startedAt: new Date().toISOString(),
        checklist: [],
        materials: [],
        clinicalNotes: "",
        timeline: [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), description: "Atendimento iniciado" }],
        ...input,
      } as LocalRow);
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("atendimentos")
      .insert({ ...toRow(input), status: "EM_ANDAMENTO", user_id: user?.id })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async update(id: string, input: Partial<Appointment>): Promise<Appointment> {
    if (!isSupabaseConfigured) return localStore.update(id, input as Partial<LocalRow>);
    const { data, error } = await createClient().from("atendimentos").update(toRow(input)).eq("id", id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
};
