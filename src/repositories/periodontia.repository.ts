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
  bleeding: boolean;
  plaque: boolean;
  suppuration: boolean;
  notes?: string;
}

export interface PeriodontalTooth {
  id: string;
  examId: string;
  toothNumber: number;
  status: PeriodontalStatus;
  mobility: number;
  furcationBuccal?: number;
  furcationLingual?: number;
  suppuration: boolean;
  plaque: boolean;
  notes?: string;
  sites: PeriodontalSite[];
}

export interface PeriodontalExam {
  id: string;
  userId?: string;
  patientId: string;
  examDate: string;
  observations?: string;
  diagnosis?: string;
  status: PeriodontalExamStatus;
  teeth: PeriodontalTooth[];
  createdAt?: string;
  updatedAt?: string;
}

export type PeriodontalExamination = PeriodontalExam;

function fromSiteRow(row: any): PeriodontalSite {
  return {
    id: row.id,
    toothId: row.dente_id,
    surface: row.superficie,
    point: row.ponto,
    probingDepth:
      row.profundidade_sondagem !== null &&
      row.profundidade_sondagem !== undefined
        ? Number(row.profundidade_sondagem)
        : undefined,
    gingivalRecession:
      row.recessao_gengival !== null &&
      row.recessao_gengival !== undefined
        ? Number(row.recessao_gengival)
        : undefined,
    clinicalAttachmentLevel:
      row.nivel_insercao_clinica !== null &&
      row.nivel_insercao_clinica !== undefined
        ? Number(row.nivel_insercao_clinica)
        : undefined,
    bleeding: row.sangramento ?? false,
    plaque: row.placa ?? false,
    suppuration: row.supuracao ?? false,
    notes: row.observacoes ?? undefined,
  };
}

function fromToothRow(row: any): PeriodontalTooth {
  return {
    id: row.id,
    examId: row.exame_id,
    toothNumber: Number(row.numero_dente),
    status: row.status ?? "PRESENTE",
    mobility: Number(row.mobilidade ?? 0),
    furcationBuccal:
      row.furca_vestibular !== null &&
      row.furca_vestibular !== undefined
        ? Number(row.furca_vestibular)
        : undefined,
    furcationLingual:
      row.furca_lingual !== null &&
      row.furca_lingual !== undefined
        ? Number(row.furca_lingual)
        : undefined,
    suppuration: row.supuracao ?? false,
    plaque: row.placa ?? false,
    notes: row.observacoes ?? undefined,
    sites: Array.isArray(row.periodontograma_sitios)
      ? row.periodontograma_sitios.map(fromSiteRow)
      : [],
  };
}

function fromExamRow(row: any): PeriodontalExam {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    patientId: row.paciente_id,
    examDate: row.data_exame,
    observations: row.observacoes ?? undefined,
    diagnosis: row.diagnostico ?? undefined,
    status: row.status ?? "EM_ANDAMENTO",
    teeth: Array.isArray(row.periodontograma_dentes)
      ? row.periodontograma_dentes.map(fromToothRow)
      : [],
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

function toothToRow(
  tooth: Omit<PeriodontalTooth, "id" | "examId" | "sites">
) {
  return {
    numero_dente: tooth.toothNumber,
    status: tooth.status,
    mobilidade: tooth.mobility,
    furca_vestibular: tooth.furcationBuccal ?? null,
    furca_lingual: tooth.furcationLingual ?? null,
    supuracao: tooth.suppuration,
    placa: tooth.plaque,
    observacoes: tooth.notes ?? null,
  };
}

function siteToRow(
  site: Omit<PeriodontalSite, "id" | "toothId">
) {
  return {
    superficie: site.surface,
    ponto: site.point,
    profundidade_sondagem:
      site.probingDepth ?? null,
    recessao_gengival:
      site.gingivalRecession ?? null,
    nivel_insercao_clinica:
      site.clinicalAttachmentLevel ?? null,
    sangramento: site.bleeding,
    placa: site.plaque,
    supuracao: site.suppuration,
    observacoes: site.notes ?? null,
  };
}

async function listExams(): Promise<PeriodontalExam[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
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

  return (data ?? []).map(fromExamRow);
}

async function get(
  id: string
): Promise<PeriodontalExam> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Exames periodontais indisponíveis no modo local."
    );
  }

  const supabase = createClient();

  const { data, error } = await supabase
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

  return fromExamRow(data);
}

async function listByPatient(
  patientId: string
): Promise<PeriodontalExam[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("exames_periodontais")
    .select(`
      *,
      periodontograma_dentes (
        *,
        periodontograma_sitios (*)
      )
    `)
    .eq("paciente_id", patientId)
    .is("deleted_at", null)
    .order("data_exame", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(fromExamRow);
}

async function createExam(input: {
  patientId: string;
  examDate?: string;
  status?: PeriodontalExamStatus;
  observations?: string;
  diagnosis?: string;
}): Promise<PeriodontalExam> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Exames periodontais indisponíveis no modo local."
    );
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const { data, error } = await supabase
    .from("exames_periodontais")
    .insert({
      user_id: user.id,
      paciente_id: input.patientId,
      data_exame:
        input.examDate ??
        new Date().toISOString().slice(0, 10),
      observacoes:
        input.observations ?? null,
      diagnostico:
        input.diagnosis ?? null,
      status:
        input.status ?? "EM_ANDAMENTO",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return get(data.id);
}

async function create(
  input: Omit<
    PeriodontalExam,
    "id" | "teeth"
  > & {
    teeth?: PeriodontalTooth[];
  }
): Promise<PeriodontalExam> {
  const exam = await createExam({
    patientId: input.patientId,
    examDate: input.examDate,
    status: input.status,
    observations: input.observations,
    diagnosis: input.diagnosis,
  });

  if (
    !input.teeth ||
    input.teeth.length === 0
  ) {
    return exam;
  }

  const supabase = createClient();

  for (const tooth of input.teeth) {
    const { data: toothRow, error: toothError } =
      await supabase
        .from("periodontograma_dentes")
        .insert({
          ...toothToRow(tooth),
          exame_id: exam.id,
        })
        .select()
        .single();

    if (toothError) {
      throw toothError;
    }

    if (tooth.sites?.length) {
      const sites = tooth.sites.map((site) => ({
        ...siteToRow(site),
        dente_id: toothRow.id,
      }));

      const { error: siteError } =
        await supabase
          .from("periodontograma_sitios")
          .insert(sites);

      if (siteError) {
        throw siteError;
      }
    }
  }

  return get(exam.id);
}

async function updateExam(
  id: string,
  input: Partial<PeriodontalExam>
): Promise<PeriodontalExam> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Exames periodontais indisponíveis no modo local."
    );
  }

  const supabase = createClient();

  const fields: Record<string, unknown> = {};

  if (input.patientId !== undefined) {
    fields.paciente_id =
      input.patientId;
  }

  if (input.examDate !== undefined) {
    fields.data_exame =
      input.examDate;
  }

  if (input.observations !== undefined) {
    fields.observacoes =
      input.observations || null;
  }

  if (input.diagnosis !== undefined) {
    fields.diagnostico =
      input.diagnosis || null;
  }

  if (input.status !== undefined) {
    fields.status =
      input.status;
  }

  fields.updated_at =
    new Date().toISOString();

  const { error } = await supabase
    .from("exames_periodontais")
    .update(fields)
    .eq("id", id);

  if (error) {
    throw error;
  }

  return get(id);
}

async function update(
  id: string,
  input: Partial<PeriodontalExam>
): Promise<PeriodontalExam> {
  return updateExam(id, input);
}

async function updateTooth(
  toothId: string,
  input: Partial<PeriodontalTooth>
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Exames periodontais indisponíveis no modo local."
    );
  }

  const fields: Record<string, unknown> = {};

  if (input.toothNumber !== undefined) {
    fields.numero_dente =
      input.toothNumber;
  }

  if (input.status !== undefined) {
    fields.status =
      input.status;
  }

  if (input.mobility !== undefined) {
    fields.mobilidade =
      input.mobility;
  }

  if (input.furcationBuccal !== undefined) {
    fields.furca_vestibular =
      input.furcationBuccal;
  }

  if (input.furcationLingual !== undefined) {
    fields.furca_lingual =
      input.furcationLingual;
  }

  if (input.suppuration !== undefined) {
    fields.supuracao =
      input.suppuration;
  }

  if (input.plaque !== undefined) {
    fields.placa =
      input.plaque;
  }

  if (input.notes !== undefined) {
    fields.observacoes =
      input.notes || null;
  }

  fields.updated_at =
    new Date().toISOString();

  const { error } = await createClient()
    .from("periodontograma_dentes")
    .update(fields)
    .eq("id", toothId);

  if (error) {
    throw error;
  }
}

async function updateSite(
  siteId: string,
  input: Partial<PeriodontalSite>
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Exames periodontais indisponíveis no modo local."
    );
  }

  const fields: Record<string, unknown> = {};

  if (input.surface !== undefined) {
    fields.superficie =
      input.surface;
  }

  if (input.point !== undefined) {
    fields.ponto =
      input.point;
  }

  if (input.probingDepth !== undefined) {
    fields.profundidade_sondagem =
      input.probingDepth ?? null;
  }

  if (input.gingivalRecession !== undefined) {
    fields.recessao_gengival =
      input.gingivalRecession ?? null;
  }

  if (
    input.clinicalAttachmentLevel !==
    undefined
  ) {
    fields.nivel_insercao_clinica =
      input.clinicalAttachmentLevel ??
      null;
  }

  if (input.bleeding !== undefined) {
    fields.sangramento =
      input.bleeding;
  }

  if (input.plaque !== undefined) {
    fields.placa =
      input.plaque;
  }

  if (input.suppuration !== undefined) {
    fields.supuracao =
      input.suppuration;
  }

  if (input.notes !== undefined) {
    fields.observacoes =
      input.notes || null;
  }

  fields.updated_at =
    new Date().toISOString();

  const { error } = await createClient()
    .from("periodontograma_sitios")
    .update(fields)
    .eq("id", siteId);

  if (error) {
    throw error;
  }
}

async function softDelete(
  id: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await createClient()
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
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await createClient()
    .from("exames_periodontais")
    .update({
      deleted_at: null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export const periodontiaRepository = {
  list,
  listExams,
  get,
  listByPatient,
  create,
  createExam,
  update,
  updateExam,
  updateTooth,
  updateSite,
  softDelete,
  restore,
};
