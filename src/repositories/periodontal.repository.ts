/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/* ============================================================
   TIPOS
============================================================ */

export type PeriodontalExamStatus = "EM_ANDAMENTO" | "FINALIZADO";

export type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

export type Surface = "VESTIBULAR" | "LINGUAL";

export type Point = "MESIAL" | "CENTRAL" | "DISTAL";

export interface PeriodontalSite {
  id: string;
  toothId: string;
  surface: Surface;
  point: Point;

  probingDepth?: number | null;
  gingivalRecession?: number | null;
  clinicalAttachmentLevel?: number | null;

  bleeding: boolean;
  plaque: boolean;
  suppuration: boolean;

  observations?: string | null;
}

export interface PeriodontalTooth {
  id: string;
  examId: string;
  toothNumber: number;

  status: ToothStatus;

  mobility: number;

  furcationBuccal?: number | null;
  furcationLingual?: number | null;

  suppuration: boolean;
  plaque: boolean;

  observations?: string | null;

  sites: PeriodontalSite[];
}

export interface PeriodontalExam {
  id: string;
  userId: string;
  patientId: string;

  examDate: string;

  observations?: string | null;
  diagnosis?: string | null;

  status: PeriodontalExamStatus;

  createdAt: string;
  updatedAt: string;

  teeth: PeriodontalTooth[];
}

/* ============================================================
   DENTES FDI
============================================================ */

export const PERIODONTAL_TEETH = [
  18,
  17,
  16,
  15,
  14,
  13,
  12,
  11,

  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,

  48,
  47,
  46,
  45,
  44,
  43,
  42,
  41,

  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
] as const;

/* ============================================================
   PONTOS DE SONDAGEM
============================================================ */

export const PERIODONTAL_SURFACES: Surface[] = [
  "VESTIBULAR",
  "LINGUAL",
];

export const PERIODONTAL_POINTS: Point[] = [
  "MESIAL",
  "CENTRAL",
  "DISTAL",
];

/* ============================================================
   MAPEADORES
============================================================ */

function mapSite(row: any): PeriodontalSite {
  return {
    id: row.id,
    toothId: row.dente_id,
    surface: row.superficie,
    point: row.ponto,

    probingDepth:
      row.profundidade_sondagem !== null
        ? Number(row.profundidade_sondagem)
        : null,

    gingivalRecession:
      row.recessao_gengival !== null
        ? Number(row.recessao_gengival)
        : null,

    clinicalAttachmentLevel:
      row.nivel_insercao_clinica !== null
        ? Number(row.nivel_insercao_clinica)
        : null,

    bleeding: row.sangramento ?? false,
    plaque: row.placa ?? false,
    suppuration: row.supuracao ?? false,

    observations: row.observacoes ?? null,
  };
}

function mapTooth(row: any): PeriodontalTooth {
  return {
    id: row.id,
    examId: row.exame_id,
    toothNumber: row.numero_dente,

    status: row.status,

    mobility: row.mobilidade ?? 0,

    furcationBuccal:
      row.furca_vestibular !== null
        ? Number(row.furca_vestibular)
        : null,

    furcationLingual:
      row.furca_lingual !== null
        ? Number(row.furca_lingual)
        : null,

    suppuration: row.supuracao ?? false,
    plaque: row.placa ?? false,

    observations: row.observacoes ?? null,

    sites: (row.periodontograma_sitios ?? []).map(mapSite),
  };
}

function mapExam(row: any): PeriodontalExam {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.paciente_id,

    examDate: row.data_exame,

    observations: row.observacoes ?? null,
    diagnosis: row.diagnostico ?? null,

    status: row.status,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    teeth: (row.periodontograma_dentes ?? []).map(mapTooth),
  };
}

/* ============================================================
   UTILITÁRIOS
============================================================ */

function createEmptySites(toothId: string) {
  return PERIODONTAL_SURFACES.flatMap((surface) =>
    PERIODONTAL_POINTS.map((point) => ({
      dente_id: toothId,
      superficie: surface,
      ponto: point,

      profundidade_sondagem: null,
      recessao_gengival: null,
      nivel_insercao_clinica: null,

      sangramento: false,
      placa: false,
      supuracao: false,

      observacoes: null,
    })),
  );
}

/* ============================================================
   REPOSITORY
============================================================ */

export const periodontalRepository = {
  /* ==========================================================
     LISTAR EXAMES DO PACIENTE
  ========================================================== */

  async listByPatient(patientId: string): Promise<PeriodontalExam[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("exames_periodontais")
      .select(
        `
          *,
          periodontograma_dentes (
            *,
            periodontograma_sitios (*)
          )
        `,
      )
      .eq("paciente_id", patientId)
      .is("deleted_at", null)
      .order("data_exame", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapExam);
  },

  /* ==========================================================
     BUSCAR EXAME
  ========================================================== */

  async getById(examId: string): Promise<PeriodontalExam | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("exames_periodontais")
      .select(
        `
          *,
          periodontograma_dentes (
            *,
            periodontograma_sitios (*)
          )
        `,
      )
      .eq("id", examId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;

    return data ? mapExam(data) : null;
  },

  /* ==========================================================
     CRIAR EXAME COMPLETO
     
     Cria:
     1 exame
     32 dentes
     192 sítios periodontais
     
     32 dentes x 6 sítios = 192 sítios
  ========================================================== */

  async createExam(
    patientId: string,
    options?: {
      examDate?: string;
      observations?: string;
      diagnosis?: string;
    },
  ): Promise<PeriodontalExam> {
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

    /* --------------------------------------------------------
       1. CRIA O EXAME
    -------------------------------------------------------- */

    const { data: exam, error: examError } = await supabase
      .from("exames_periodontais")
      .insert({
        user_id: user.id,
        paciente_id: patientId,
        data_exame: options?.examDate ?? new Date().toISOString().slice(0, 10),
        observacoes: options?.observations ?? null,
        diagnostico: options?.diagnosis ?? null,
        status: "EM_ANDAMENTO",
      })
      .select()
      .single();

    if (examError) throw examError;

    /* --------------------------------------------------------
       2. CRIA OS 32 DENTES
    -------------------------------------------------------- */

    const teethPayload = PERIODONTAL_TEETH.map((number) => ({
      exame_id: exam.id,
      numero_dente: number,

      status: "PRESENTE",

      mobilidade: 0,

      furca_vestibular: null,
      furca_lingual: null,

      supuracao: false,
      placa: false,

      observacoes: null,
    }));

    const { data: teeth, error: teethError } = await supabase
      .from("periodontograma_dentes")
      .insert(teethPayload)
      .select();

    if (teethError) {
      await supabase
        .from("exames_periodontais")
        .delete()
        .eq("id", exam.id);

      throw teethError;
    }

    /* --------------------------------------------------------
       3. CRIA OS 6 SÍTIOS DE CADA DENTE
       
       32 dentes x 6 = 192 registros
    -------------------------------------------------------- */

    const sitesPayload = (teeth ?? []).flatMap((tooth) =>
      createEmptySites(tooth.id),
    );

    const { error: sitesError } = await supabase
      .from("periodontograma_sitios")
      .insert(sitesPayload);

    if (sitesError) {
      await supabase
        .from("exames_periodontais")
        .delete()
        .eq("id", exam.id);

      throw sitesError;
    }

    /* --------------------------------------------------------
       4. DEVOLVE O EXAME COMPLETO
    -------------------------------------------------------- */

    const createdExam = await this.getById(exam.id);

    if (!createdExam) {
      throw new Error("Exame criado, mas não foi possível carregá-lo.");
    }

    return createdExam;
  },

  /* ==========================================================
     ATUALIZAR EXAME
  ========================================================== */

  async updateExam(
    examId: string,
    input: {
      examDate?: string;
      observations?: string | null;
      diagnosis?: string | null;
      status?: PeriodontalExamStatus;
    },
  ): Promise<PeriodontalExam> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("exames_periodontais")
      .update({
        data_exame: input.examDate,
        observacoes: input.observations,
        diagnostico: input.diagnosis,
        status: input.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", examId)
      .select()
      .single();

    if (error) throw error;

    const exam = await this.getById(data.id);

    if (!exam) {
      throw new Error("Não foi possível carregar o exame atualizado.");
    }

    return exam;
  },

  /* ==========================================================
     ATUALIZAR DENTE
  ========================================================== */

  async updateTooth(
    toothId: string,
    input: Partial<{
      status: ToothStatus;
      mobility: number;
      furcationBuccal: number | null;
      furcationLingual: number | null;
      suppuration: boolean;
      plaque: boolean;
      observations: string | null;
    }>,
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("periodontograma_dentes")
      .update({
        status: input.status,
        mobilidade: input.mobility,
        furca_vestibular: input.furcationBuccal,
        furca_lingual: input.furcationLingual,
        supuracao: input.suppuration,
        placa: input.plaque,
        observacoes: input.observations,
        updated_at: new Date().toISOString(),
      })
      .eq("id", toothId);

    if (error) throw error;
  },

  /* ==========================================================
     ATUALIZAR SÍTIO
  ========================================================== */

  async updateSite(
    siteId: string,
    input: Partial<{
      probingDepth: number | null;
      gingivalRecession: number | null;
      clinicalAttachmentLevel: number | null;
      bleeding: boolean;
      plaque: boolean;
      suppuration: boolean;
      observations: string | null;
    }>,
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("periodontograma_sitios")
      .update({
        profundidade_sondagem: input.probingDepth,
        recessao_gengival: input.gingivalRecession,
        nivel_insercao_clinica: input.clinicalAttachmentLevel,

        sangramento: input.bleeding,
        placa: input.plaque,
        supuracao: input.suppuration,

        observacoes: input.observations,

        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (error) throw error;
  },

  /* ==========================================================
     ATUALIZAR SÍTIO E CALCULAR NIC
     
     NIC = profundidade de sondagem + recessão
     
     Exemplo:
     PS = 5
     Recessão = 2
     NIC = 7
  ========================================================== */

  async updateSiteMeasurements(
    siteId: string,
    input: {
      probingDepth?: number | null;
      gingivalRecession?: number | null;
      bleeding?: boolean;
      plaque?: boolean;
      suppuration?: boolean;
    },
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const probingDepth = input.probingDepth ?? null;
    const recession = input.gingivalRecession ?? null;

    let clinicalAttachmentLevel: number | null = null;

    if (probingDepth !== null) {
      clinicalAttachmentLevel =
        probingDepth + (recession ?? 0);
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("periodontograma_sitios")
      .update({
        profundidade_sondagem: probingDepth,
        recessao_gengival: recession,
        nivel_insercao_clinica: clinicalAttachmentLevel,

        sangramento: input.bleeding ?? false,
        placa: input.plaque ?? false,
        supuracao: input.suppuration ?? false,

        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    if (error) throw error;
  },

  /* ==========================================================
     FINALIZAR EXAME
  ========================================================== */

  async finalizeExam(examId: string): Promise<PeriodontalExam> {
    return this.updateExam(examId, {
      status: "FINALIZADO",
    });
  },

  /* ==========================================================
     EXCLUIR EXAME
     
     Soft delete.
  ========================================================== */

  async softDeleteExam(examId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("exames_periodontais")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", examId);

    if (error) throw error;
  },

  /* ==========================================================
     RESTAURAR EXAME
  ========================================================== */

  async restoreExam(examId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não está configurado.");
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("exames_periodontais")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", examId);

    if (error) throw error;
  },
};
