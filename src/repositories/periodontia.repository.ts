/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PeriodontalExamStatus =
  | "EM_ANDAMENTO"
  | "FINALIZADO";

export type PeriodontalStatus =
  | "PRESENTE"
  | "AUSENTE"
  | "IMPLANTE";

export type PeriodontalSurface =
  | "VESTIBULAR"
  | "LINGUAL";

export type PeriodontalPoint =
  | "MESIAL"
  | "CENTRAL"
  | "DISTAL";

export interface PeriodontalSite {
  id: string;
  toothId: string;
  surface: PeriodontalSurface;
  point: PeriodontalPoint;
  probingDepth?: number;
  gingivalRecession?: number;
  clinicalAttachmentLevel?: number;
  bleeding?: boolean;
  plaque?: boolean;
  suppuration?: boolean;
  observations?: string;
}

export interface PeriodontalTooth {
  id: string;
  examId: string;
  toothNumber: number;
  status: PeriodontalStatus;
  mobility: number;
  buccalFurcation?: number;
  lingualFurcation?: number;
  suppuration: boolean;
  plaque: boolean;
  observations?: string;
  sites: PeriodontalSite[];
}

export interface PeriodontalExam {
  id: string;
  userId?: string;
  patientId: string;
  date: string;
  observations?: string;
  diagnosis?: string;
  status: PeriodontalExamStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  teeth: PeriodontalTooth[];
}

export type PeriodontalExamination =
  PeriodontalExam;

export interface CreatePeriodontalExamInput {
  patientId: string;
  date?: string;
  observations?: string;
  diagnosis?: string;
  status?: PeriodontalExamStatus;
}

export interface UpdatePeriodontalExamInput {
  date?: string;
  observations?: string;
  diagnosis?: string;
  status?: PeriodontalExamStatus;
}

function mapSite(row: any): PeriodontalSite {
  return {
    id: row.id,
    toothId: row.dente_id,
    surface: row.superficie,
    point: row.ponto,
    probingDepth:
      row.profundidade_sondagem ?? undefined,
    gingivalRecession:
      row.recessao_gengival ?? undefined,
    clinicalAttachmentLevel:
      row.nivel_insercao_clinica ?? undefined,
    bleeding:
      row.sangramento ?? false,
    plaque:
      row.placa ?? false,
    suppuration:
      row.supuracao ?? false,
    observations:
      row.observacoes ?? undefined,
  };
}

function mapTooth(row: any): PeriodontalTooth {
  return {
    id: row.id,
    examId: row.exame_id,
    toothNumber: row.numero_dente,
    status: row.status ?? "PRESENTE",
    mobility: row.mobilidade ?? 0,
    buccalFurcation:
      row.furca_vestibular ?? undefined,
    lingualFurcation:
      row.furca_lingual ?? undefined,
    suppuration:
      row.supuracao ?? false,
    plaque:
      row.placa ?? false,
    observations:
      row.observacoes ?? undefined,
    sites: Array.isArray(row.periodontograma_sitios)
      ? row.periodontograma_sitios.map(mapSite)
      : [],
  };
}

function mapExam(row: any): PeriodontalExam {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    patientId: row.paciente_id,
    date: row.data_exame,
    observations:
      row.observacoes ?? undefined,
    diagnosis:
      row.diagnostico ?? undefined,
    status:
      row.status ?? "EM_ANDAMENTO",
    createdAt:
      row.created_at ?? undefined,
    updatedAt:
      row.updated_at ?? undefined,
    deletedAt:
      row.deleted_at ?? null,
    teeth: Array.isArray(row.periodontograma_dentes)
      ? row.periodontograma_dentes.map(mapTooth)
      : [],
  };
}

async function getCurrentUserId() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

async function listSupabase(): Promise<PeriodontalExam[]> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("exames_periodontais")
    .select(`
      *,
      periodontograma_dentes (
        *,
        periodontograma_sitios (*)
      )
    `)
    .is("deleted_at", null)
    .order("data_exame", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapExam);
}

async function getSupabase(
  id: string
): Promise<PeriodontalExam> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("exames_periodontais")
    .select(`
      *,
      periodontograma_dentes (
        *,
        periodontograma_sitios (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return mapExam(data);
}

async function createExam(
  input: CreatePeriodontalExamInput
): Promise<PeriodontalExam> {
  if (!input.patientId) {
    throw new Error(
      "É necessário selecionar um paciente."
    );
  }

  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      patientId: input.patientId,
      date:
        input.date ??
        new Date()
          .toISOString()
          .slice(0, 10),
      observations:
        input.observations,
      diagnosis:
        input.diagnosis,
      status:
        input.status ??
        "EM_ANDAMENTO",
      teeth: [],
    };
  }

  const supabase = createClient();
  const userId =
    await getCurrentUserId();

  const {
    data,
    error,
  } = await supabase
    .from("exames_periodontais")
    .insert({
      user_id: userId,
      paciente_id:
        input.patientId,
      data_exame:
        input.date ??
        new Date()
          .toISOString()
          .slice(0, 10),
      observacoes:
        input.observations ??
        null,
      diagnostico:
        input.diagnosis ??
        null,
      status:
        input.status ??
        "EM_ANDAMENTO",
    })
    .select(`
      *,
      periodontograma_dentes (
        *,
        periodontograma_sitios (*)
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return mapExam(data);
}

async function updateExam(
  id: string,
  input: UpdatePeriodontalExamInput
): Promise<PeriodontalExam> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Atualização local de exames periodontais ainda não está disponível."
    );
  }

  const supabase = createClient();

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.date !== undefined) {
    payload.data_exame =
      input.date;
  }

  if (
    input.observations !== undefined
  ) {
    payload.observacoes =
      input.observations ||
      null;
  }

  if (
    input.diagnosis !== undefined
  ) {
    payload.diagnostico =
      input.diagnosis ||
      null;
  }

  if (input.status !== undefined) {
    payload.status =
      input.status;
  }

  const {
    error,
  } = await supabase
    .from("exames_periodontais")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return getSupabase(id);
}

async function softDelete(
  id: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("exames_periodontais")
    .update({
      deleted_at:
        new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

async function restore(
  id: string
): Promise<PeriodontalExam> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Restauração local ainda não está disponível."
    );
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("exames_periodontais")
    .update({
      deleted_at: null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return getSupabase(id);
}

async function listByPatient(
  patientId: string
): Promise<PeriodontalExam[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("exames_periodontais")
    .select(`
      *,
      periodontograma_dentes (
        *,
        periodontograma_sitios (*)
      )
    `)
    .eq(
      "paciente_id",
      patientId
    )
    .is("deleted_at", null)
    .order("data_exame", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapExam);
}

async function saveTooth(
  tooth: PeriodontalTooth
): Promise<PeriodontalTooth> {
  if (!isSupabaseConfigured) {
    return tooth;
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("periodontograma_dentes")
    .upsert(
      {
        id: tooth.id,
        exame_id:
          tooth.examId,
        numero_dente:
          tooth.toothNumber,
        status:
          tooth.status,
        mobilidade:
          tooth.mobility,
        furca_vestibular:
          tooth.buccalFurcation ??
          null,
        furca_lingual:
          tooth.lingualFurcation ??
          null,
        supuracao:
          tooth.suppuration,
        placa:
          tooth.plaque,
        observacoes:
          tooth.observations ??
          null,
      },
      {
        onConflict:
          "exame_id,numero_dente",
      }
    )
    .select(`
      *,
      periodontograma_sitios (*)
    `)
    .single();

  if (error) {
    throw error;
  }

  return mapTooth(data);
}

async function saveSite(
  site: PeriodontalSite
): Promise<PeriodontalSite> {
  if (!isSupabaseConfigured) {
    return site;
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("periodontograma_sitios")
    .upsert(
      {
        id: site.id,
        dente_id:
          site.toothId,
        superficie:
          site.surface,
        ponto:
          site.point,
        profundidade_sondagem:
          site.probingDepth ??
          null,
        recessao_gengival:
          site.gingivalRecession ??
          null,
        nivel_insercao_clinica:
          site.clinicalAttachmentLevel ??
          null,
        sangramento:
          site.bleeding ??
          false,
        placa:
          site.plaque ??
          false,
        supuracao:
          site.suppuration ??
          false,
        observacoes:
          site.observations ??
          null,
      },
      {
        onConflict:
          "dente_id,superficie,ponto",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapSite(data);
}

export const periodontiaRepository = {
  list: listSupabase,
  listExams: listSupabase,

  get: getSupabase,

  getExam: getSupabase,

  listByPatient,

  create: createExam,
  createExam,

  update: updateExam,
  updateExam,

  softDelete,

  delete: softDelete,

  restore,

  saveTooth,

  saveSite,
};
