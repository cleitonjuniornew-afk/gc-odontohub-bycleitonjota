/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PeriodontalStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

export type PeriodontalExamStatus = "EM_ANDAMENTO" | "FINALIZADO";

export type PeriodontalSurface = "VESTIBULAR" | "LINGUAL";

export type PeriodontalPoint = "MESIAL" | "CENTRAL" | "DISTAL";

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
  observations?: string;
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
  observations?: string;
  sites: PeriodontalSite[];
}

export interface PeriodontalExam {
  id: string;
  userId: string;
  patientId: string;
  date: string;
  observations?: string;
  diagnosis?: string;
  status: PeriodontalExamStatus;
  createdAt: string;
  updatedAt: string;
  teeth: PeriodontalTooth[];
}

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
    observations: row.observacoes ?? undefined,
  };
}

function fromToothRow(row: any, sites: PeriodontalSite[] = []): PeriodontalTooth {
  return {
    id: row.id,
    examId: row.exame_id,
    toothNumber: row.numero_dente,
    status: row.status,
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
    observations: row.observacoes ?? undefined,
    sites,
  };
}

function fromExamRow(
  row: any,
  teeth: PeriodontalTooth[] = []
): PeriodontalExam {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.paciente_id,
    date: row.data_exame,
    observations: row.observacoes ?? undefined,
    diagnosis: row.diagnostico ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    teeth,
  };
}

export const periodontiaRepository = {
  async listExams(): Promise<PeriodontalExam[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const supabase = createClient();

    const { data: exams, error: examsError } = await supabase
      .from("exames_periodontais")
      .select("*")
      .is("deleted_at", null)
      .order("data_exame", { ascending: false });

    if (examsError) throw examsError;

    if (!exams || exams.length === 0) {
      return [];
    }

    const examIds = exams.map((exam) => exam.id);

    const { data: teeth, error: teethError } = await supabase
      .from("periodontograma_dentes")
      .select("*")
      .in("exame_id", examIds)
      .order("numero_dente", { ascending: true });

    if (teethError) throw teethError;

    const toothIds = (teeth ?? []).map((tooth) => tooth.id);

    let sites: any[] = [];

    if (toothIds.length > 0) {
      const { data: siteData, error: sitesError } = await supabase
        .from("periodontograma_sitios")
        .select("*")
        .in("dente_id", toothIds);

      if (sitesError) throw sitesError;

      sites = siteData ?? [];
    }

    return exams.map((exam) => {
      const examTeeth = (teeth ?? [])
        .filter((tooth) => tooth.exame_id === exam.id)
        .map((tooth) =>
          fromToothRow(
            tooth,
            sites
              .filter((site) => site.dente_id === tooth.id)
              .map(fromSiteRow)
          )
        );

      return fromExamRow(exam, examTeeth);
    });
  },

  async getExam(id: string): Promise<PeriodontalExam | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const supabase = createClient();

    const { data: exam, error: examError } = await supabase
      .from("exames_periodontais")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (examError) throw examError;

    if (!exam) {
      return null;
    }

    const { data: teeth, error: teethError } = await supabase
      .from("periodontograma_dentes")
      .select("*")
      .eq("exame_id", id)
      .order("numero_dente", { ascending: true });

    if (teethError) throw teethError;

    const toothIds = (teeth ?? []).map((tooth) => tooth.id);

    let sites: any[] = [];

    if (toothIds.length > 0) {
      const { data: siteData, error: sitesError } = await supabase
        .from("periodontograma_sitios")
        .select("*")
        .in("dente_id", toothIds);

      if (sitesError) throw sitesError;

      sites = siteData ?? [];
    }

    const mappedTeeth = (teeth ?? []).map((tooth) =>
      fromToothRow(
        tooth,
        sites
          .filter((site) => site.dente_id === tooth.id)
          .map(fromSiteRow)
      )
    );

    return fromExamRow(exam, mappedTeeth);
  },

  async createExam(input: {
    patientId: string;
    date?: string;
    observations?: string;
    diagnosis?: string;
  }): Promise<PeriodontalExam> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
      .from("exames_periodontais")
      .insert({
        user_id: user.id,
        paciente_id: input.patientId,
        data_exame: input.date ?? new Date().toISOString().slice(0, 10),
        observacoes: input.observations ?? null,
        diagnostico: input.diagnosis ?? null,
        status: "EM_ANDAMENTO",
      })
      .select()
      .single();

    if (error) throw error;

    return fromExamRow(data, []);
  },

  async updateExam(
    id: string,
    input: {
      date?: string;
      observations?: string;
      diagnosis?: string;
      status?: PeriodontalExamStatus;
    }
  ): Promise<PeriodontalExam> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const updateData: Record<string, any> = {};

    if (input.date !== undefined) {
      updateData.data_exame = input.date;
    }

    if (input.observations !== undefined) {
      updateData.observacoes = input.observations;
    }

    if (input.diagnosis !== undefined) {
      updateData.diagnostico = input.diagnosis;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("exames_periodontais")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return (await this.getExam(id)) ?? fromExamRow(data, []);
  },

  async createTooth(input: {
    examId: string;
    toothNumber: number;
    status?: PeriodontalStatus;
  }): Promise<PeriodontalTooth> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("periodontograma_dentes")
      .insert({
        exame_id: input.examId,
        numero_dente: input.toothNumber,
        status: input.status ?? "PRESENTE",
      })
      .select()
      .single();

    if (error) throw error;

    return fromToothRow(data, []);
  },

  async updateTooth(
    id: string,
    input: {
      status?: PeriodontalStatus;
      mobility?: number;
      furcationBuccal?: number | null;
      furcationLingual?: number | null;
      suppuration?: boolean;
      plaque?: boolean;
      observations?: string | null;
    }
  ): Promise<PeriodontalTooth> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const updateData: Record<string, any> = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.mobility !== undefined) {
      updateData.mobilidade = input.mobility;
    }

    if (input.furcationBuccal !== undefined) {
      updateData.furca_vestibular = input.furcationBuccal;
    }

    if (input.furcationLingual !== undefined) {
      updateData.furca_lingual = input.furcationLingual;
    }

    if (input.suppuration !== undefined) {
      updateData.supuracao = input.suppuration;
    }

    if (input.plaque !== undefined) {
      updateData.placa = input.plaque;
    }

    if (input.observations !== undefined) {
      updateData.observacoes = input.observations;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("periodontograma_dentes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return fromToothRow(data, []);
  },

  async upsertSite(input: {
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
  }): Promise<PeriodontalSite> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("periodontograma_sitios")
      .upsert(
        {
          dente_id: input.toothId,
          superficie: input.surface,
          ponto: input.point,
          profundidade_sondagem: input.probingDepth ?? null,
          recessao_gengival: input.gingivalRecession ?? null,
          nivel_insercao_clinica:
            input.clinicalAttachmentLevel ?? null,
          sangramento: input.bleeding ?? false,
          placa: input.plaque ?? false,
          supuracao: input.suppuration ?? false,
          observacoes: input.observations ?? null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "dente_id,superficie,ponto",
        }
      )
      .select()
      .single();

    if (error) throw error;

    return fromSiteRow(data);
  },

  async deleteSite(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const { error } = await createClient()
      .from("periodontograma_sitios")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async initializeExamTeeth(
    examId: string,
    toothNumbers: number[]
  ): Promise<PeriodontalTooth[]> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const rows = toothNumbers.map((number) => ({
      exame_id: examId,
      numero_dente: number,
      status: "PRESENTE",
    }));

    const { data, error } = await supabase
      .from("periodontograma_dentes")
      .upsert(rows, {
        onConflict: "exame_id,numero_dente",
      })
      .select();

    if (error) throw error;

    return (data ?? []).map((row) => fromToothRow(row, []));
  },

  async finalizeExam(id: string): Promise<PeriodontalExam> {
    return this.updateExam(id, {
      status: "FINALIZADO",
    });
  },

  async deleteExam(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const { error } = await createClient()
      .from("exames_periodontais")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },
};
