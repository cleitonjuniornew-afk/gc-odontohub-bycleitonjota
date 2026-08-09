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

export type PeriodontalExamination = PeriodontalExam;

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

export interface CreatePeriodontalToothInput {
  examId: string;
  toothNumber: number;
  status?: PeriodontalStatus;
  mobility?: number;
  furcationBuccal?: number | null;
  furcationLingual?: number | null;
  suppuration?: boolean;
  plaque?: boolean;
  observations?: string | null;
}

export interface UpdatePeriodontalToothInput {
  status?: PeriodontalStatus;
  mobility?: number;
  furcationBuccal?: number | null;
  furcationLingual?: number | null;
  suppuration?: boolean;
  plaque?: boolean;
  observations?: string | null;
}

export interface CreatePeriodontalSiteInput {
  toothId: string;
  surface: PeriodontalSurface;
  point: PeriodontalPoint;
  probingDepth?: number | null;
  gingivalRecession?: number | null;
  clinicalAttachmentLevel?: number | null;
  bleeding?: boolean;
  plaque?: boolean;
  suppuration?: boolean;
  observations?: string | null;
}

export interface UpdatePeriodontalSiteInput {
  surface?: PeriodontalSurface;
  point?: PeriodontalPoint;
  probingDepth?: number | null;
  gingivalRecession?: number | null;
  clinicalAttachmentLevel?: number | null;
  bleeding?: boolean;
  plaque?: boolean;
  suppuration?: boolean;
  observations?: string | null;
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
    status:
      row.status ?? "PRESENTE",
    mobility:
      row.mobilidade ?? 0,
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
    sites:
      Array.isArray(
        row.periodontograma_sitios
      )
        ? row.periodontograma_sitios.map(
            mapSite
          )
        : [],
  };
}

function mapExam(row: any): PeriodontalExam {
  return {
    id: row.id,
    userId:
      row.user_id ?? undefined,
    patientId:
      row.paciente_id,
    date:
      row.data_exame,
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
    teeth:
      Array.isArray(
        row.periodontograma_dentes
      )
        ? row.periodontograma_dentes.map(
            mapTooth
          )
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

async function listSupabase(): Promise<
  PeriodontalExam[]
> {
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
    input.observations !==
    undefined
  ) {
    payload.observacoes =
      input.observations || null;
  }

  if (
    input.diagnosis !==
    undefined
  ) {
    payload.diagnostico =
      input.diagnosis || null;
  }

  if (input.status !== undefined) {
    payload.status =
      input.status;
  }

  if (
    Object.keys(payload).length >
    0
  ) {
    const {
      error,
    } = await supabase
      .from("exames_periodontais")
      .update(payload)
      .eq("id", id);

    if (error) {
      throw error;
    }
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

async function createTooth(
  input: CreatePeriodontalToothInput
): Promise<PeriodontalTooth> {
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      examId: input.examId,
      toothNumber:
        input.toothNumber,
      status:
        input.status ??
        "PRESENTE",
      mobility:
        input.mobility ?? 0,
      buccalFurcation:
        input.furcationBuccal ??
        undefined,
      lingualFurcation:
        input.furcationLingual ??
        undefined,
      suppuration:
        input.suppuration ??
        false,
      plaque:
        input.plaque ?? false,
      observations:
        input.observations ??
        undefined,
      sites: [],
    };
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("periodontograma_dentes")
    .upsert(
      {
        exame_id:
          input.examId,
        numero_dente:
          input.toothNumber,
        status:
          input.status ??
          "PRESENTE",
        mobilidade:
          input.mobility ?? 0,
        furca_vestibular:
          input.furcationBuccal ??
          null,
        furca_lingual:
          input.furcationLingual ??
          null,
        supuracao:
          input.suppuration ??
          false,
        placa:
          input.plaque ?? false,
        observacoes:
          input.observations ??
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

async function updateTooth(
  id: string,
  input: UpdatePeriodontalToothInput
): Promise<PeriodontalTooth> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Atualização local de dente periodontal ainda não está disponível."
    );
  }

  const supabase = createClient();

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.status !== undefined) {
    payload.status =
      input.status;
  }

  if (input.mobility !== undefined) {
    payload.mobilidade =
      input.mobility;
  }

  if (
    input.furcationBuccal !==
    undefined
  ) {
    payload.furca_vestibular =
      input.furcationBuccal;
  }

  if (
    input.furcationLingual !==
    undefined
  ) {
    payload.furca_lingual =
      input.furcationLingual;
  }

  if (
    input.suppuration !==
    undefined
  ) {
    payload.supuracao =
      input.suppuration;
  }

  if (input.plaque !== undefined) {
    payload.placa =
      input.plaque;
  }

  if (
    input.observations !==
    undefined
  ) {
    payload.observacoes =
      input.observations ??
      null;
  }

  payload.updated_at =
    new Date().toISOString();

  const {
    error,
  } = await supabase
    .from("periodontograma_dentes")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }

  const {
    data,
    error: selectError,
  } = await supabase
    .from("periodontograma_dentes")
    .select(`
      *,
      periodontograma_sitios (*)
    `)
    .eq("id", id)
    .single();

  if (selectError) {
    throw selectError;
  }

  return mapTooth(data);
}

async function saveTooth(
  tooth: PeriodontalTooth
): Promise<PeriodontalTooth> {
  return createTooth({
    examId: tooth.examId,
    toothNumber:
      tooth.toothNumber,
    status: tooth.status,
    mobility: tooth.mobility,
    furcationBuccal:
      tooth.buccalFurcation ??
      null,
    furcationLingual:
      tooth.lingualFurcation ??
      null,
    suppuration:
      tooth.suppuration,
    plaque:
      tooth.plaque,
    observations:
      tooth.observations ??
      null,
  });
}

async function deleteTooth(
  id: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("periodontograma_dentes")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

async function createSite(
  input: CreatePeriodontalSiteInput
): Promise<PeriodontalSite> {
  if (!isSupabaseConfigured) {
    return {
      id: crypto.randomUUID(),
      toothId: input.toothId,
      surface:
        input.surface,
      point:
        input.point,
      probingDepth:
        input.probingDepth ??
        undefined,
      gingivalRecession:
        input.gingivalRecession ??
        undefined,
      clinicalAttachmentLevel:
        input.clinicalAttachmentLevel ??
        undefined,
      bleeding:
        input.bleeding ??
        false,
      plaque:
        input.plaque ??
        false,
      suppuration:
        input.suppuration ??
        false,
      observations:
        input.observations ??
        undefined,
    };
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("periodontograma_sitios")
    .upsert(
      {
        dente_id:
          input.toothId,
        superficie:
          input.surface,
        ponto:
          input.point,
        profundidade_sondagem:
          input.probingDepth ??
          null,
        recessao_gengival:
          input.gingivalRecession ??
          null,
        nivel_insercao_clinica:
          input.clinicalAttachmentLevel ??
          null,
        sangramento:
          input.bleeding ??
          false,
        placa:
          input.plaque ??
          false,
        supuracao:
          input.suppuration ??
          false,
        observacoes:
          input.observations ??
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

async function updateSite(
  id: string,
  input: UpdatePeriodontalSiteInput
): Promise<PeriodontalSite> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Atualização local de sítio periodontal ainda não está disponível."
    );
  }

  const supabase = createClient();

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.surface !== undefined) {
    payload.superficie =
      input.surface;
  }

  if (input.point !== undefined) {
    payload.ponto =
      input.point;
  }

  if (
    input.probingDepth !==
    undefined
  ) {
    payload.profundidade_sondagem =
      input.probingDepth;
  }

  if (
    input.gingivalRecession !==
    undefined
  ) {
    payload.recessao_gengival =
      input.gingivalRecession;
  }

  if (
    input.clinicalAttachmentLevel !==
    undefined
  ) {
    payload.nivel_insercao_clinica =
      input.clinicalAttachmentLevel;
  }

  if (
    input.bleeding !==
    undefined
  ) {
    payload.sangramento =
      input.bleeding;
  }

  if (input.plaque !== undefined) {
    payload.placa =
      input.plaque;
  }

  if (
    input.suppuration !==
    undefined
  ) {
    payload.supuracao =
      input.suppuration;
  }

  if (
    input.observations !==
    undefined
  ) {
    payload.observacoes =
      input.observations ??
      null;
  }

  payload.updated_at =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("periodontograma_sitios")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapSite(data);
}

async function saveSite(
  site: PeriodontalSite
): Promise<PeriodontalSite> {
  return createSite({
    toothId:
      site.toothId,
    surface:
      site.surface,
    point:
      site.point,
    probingDepth:
      site.probingDepth ??
      null,
    gingivalRecession:
      site.gingivalRecession ??
      null,
    clinicalAttachmentLevel:
      site.clinicalAttachmentLevel ??
      null,
    bleeding:
      site.bleeding ??
      false,
    plaque:
      site.plaque ??
      false,
    suppuration:
      site.suppuration ??
      false,
    observations:
      site.observations ??
      null,
  });
}

async function deleteSite(
  id: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("periodontograma_sitios")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
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

  createTooth,
  saveTooth,
  updateTooth,
  deleteTooth,

  createSite,
  saveSite,
  updateSite,
  deleteSite,
};
