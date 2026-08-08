/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";

/* ============================================================
   TIPOS
============================================================ */

export type PeriodontalExamStatus =
  | "EM_ANDAMENTO"
  | "FINALIZADO";

export type PeriodontalStatus =
  | "PRESENTE"
  | "AUSENTE"
  | "IMPLANTE";

export type PeriodontalToothStatus =
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

/* ============================================================
   SÍTIO PERIODONTAL
============================================================ */

export interface PeriodontalSite {
  id?: string;
  toothId?: string;

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

/* ============================================================
   DENTE PERIODONTAL
============================================================ */

export interface PeriodontalTooth {
  id?: string;
  examinationId?: string;

  number: number;

  status: PeriodontalStatus;

  mobility: number;

  furcationBuccal?: number;
  furcationLingual?: number;

  suppuration: boolean;
  plaque: boolean;

  notes?: string;

  sites: PeriodontalSite[];
}

/* ============================================================
   EXAME PERIODONTAL
============================================================ */

export interface PeriodontalExamination {
  id: string;

  patientId: string;

  examinationDate: string;

  observations?: string;
  diagnosis?: string;

  status: PeriodontalExamStatus;

  createdAt?: string;
  updatedAt?: string;

  teeth: PeriodontalTooth[];
}

/*
 * Compatibilidade com o hook existente
 */
export type PeriodontalExam =
  PeriodontalExamination;

/* ============================================================
   LOCAL STORE
============================================================ */

type LocalRow = PeriodontalExamination & {
  deletedAt?: string | null;
};

const localStore =
  createLocalStore<LocalRow>([]);

/* ============================================================
   CONVERSOR — SÍTIO
============================================================ */

function fromSiteRow(
  row: any
): PeriodontalSite {
  return {
    id: row.id,

    toothId:
      row.dente_id,

    surface:
      row.superficie ??
      "VESTIBULAR",

    point:
      row.ponto ??
      "CENTRAL",

    probingDepth:
      row.profundidade_sondagem !== null &&
      row.profundidade_sondagem !== undefined
        ? Number(
            row.profundidade_sondagem
          )
        : undefined,

    gingivalRecession:
      row.recessao_gengival !== null &&
      row.recessao_gengival !== undefined
        ? Number(
            row.recessao_gengival
          )
        : undefined,

    clinicalAttachmentLevel:
      row.nivel_insercao_clinica !== null &&
      row.nivel_insercao_clinica !== undefined
        ? Number(
            row.nivel_insercao_clinica
          )
        : undefined,

    bleeding:
      row.sangramento ??
      false,

    plaque:
      row.placa ??
      false,

    suppuration:
      row.supuracao ??
      false,

    notes:
      row.observacoes ??
      undefined,
  };
}

/* ============================================================
   CONVERSOR — DENTE
============================================================ */

function fromToothRow(
  row: any
): PeriodontalTooth {
  return {
    id:
      row.id,

    examinationId:
      row.exame_id,

    number:
      Number(
        row.numero_dente
      ),

    status:
      row.status ??
      "PRESENTE",

    mobility:
      Number(
        row.mobilidade ??
        0
      ),

    furcationBuccal:
      row.furca_vestibular !== null &&
      row.furca_vestibular !== undefined
        ? Number(
            row.furca_vestibular
          )
        : undefined,

    furcationLingual:
      row.furca_lingual !== null &&
      row.furca_lingual !== undefined
        ? Number(
            row.furca_lingual
          )
        : undefined,

    suppuration:
      row.supuracao ??
      false,

    plaque:
      row.placa ??
      false,

    notes:
      row.observacoes ??
      undefined,

    sites:
      Array.isArray(
        row.periodontograma_sitios
      )
        ? row.periodontograma_sitios.map(
            fromSiteRow
          )
        : [],
  };
}

/* ============================================================
   CONVERSOR — EXAME
============================================================ */

function fromExaminationRow(
  row: any
): PeriodontalExamination {
  return {
    id:
      row.id,

    patientId:
      row.paciente_id,

    examinationDate:
      row.data_exame,

    observations:
      row.observacoes ??
      undefined,

    diagnosis:
      row.diagnostico ??
      undefined,

    status:
      row.status ??
      "EM_ANDAMENTO",

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    teeth:
      Array.isArray(
        row.periodontograma_dentes
      )
        ? row.periodontograma_dentes.map(
            fromToothRow
          )
        : [],
  };
}

/* ============================================================
   32 DENTES
============================================================ */

const TOOTH_NUMBERS = [
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
];

/* ============================================================
   REPOSITORY
============================================================ */

export const periodontiaRepository = {

  /* ==========================================================
     LISTAR TODOS OS EXAMES
  ========================================================== */

  async list(): Promise<
    PeriodontalExamination[]
  > {

    if (!isSupabaseConfigured) {
      return localStore.list();
    }

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .select(`
          *,
          periodontograma_dentes (
            *,
            periodontograma_sitios (*)
          )
        `)
        .is(
          "deleted_at",
          null
        )
        .order(
          "data_exame",
          {
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      fromExaminationRow
    );
  },

  /* ==========================================================
     BUSCAR EXAME POR ID
  ========================================================== */

  async get(
    id: string
  ): Promise<PeriodontalExamination> {

    if (!isSupabaseConfigured) {

      const exams =
        await localStore.list();

      const exam =
        exams.find(
          (item) =>
            item.id === id
        );

      if (!exam) {
        throw new Error(
          "Exame periodontal não encontrado."
        );
      }

      return exam;
    }

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .select(`
          *,
          periodontograma_dentes (
            *,
            periodontograma_sitios (*)
          )
        `)
        .eq(
          "id",
          id
        )
        .single();

    if (error) {
      throw error;
    }

    return fromExaminationRow(
      data
    );
  },

  /* ==========================================================
     LISTAR EXAMES DO PACIENTE
  ========================================================== */

  async listByPatient(
    patientId: string
  ): Promise<
    PeriodontalExamination[]
  > {

    if (!isSupabaseConfigured) {

      const exams =
        await localStore.list();

      return exams.filter(
        (exam) =>
          exam.patientId ===
          patientId
      );
    }

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
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
        .is(
          "deleted_at",
          null
        )
        .order(
          "data_exame",
          {
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      fromExaminationRow
    );
  },

  /* ==========================================================
     CRIAR EXAME
  ========================================================== */

  async create(
    patientId: string
  ): Promise<PeriodontalExamination> {

    if (!isSupabaseConfigured) {

      const teeth =
        TOOTH_NUMBERS.map(
          (number) => ({
            number,

            status:
              "PRESENTE" as PeriodontalStatus,

            mobility: 0,

            suppuration:
              false,

            plaque:
              false,

            sites: [],
          })
        );

      return localStore.create({
        id:
          crypto.randomUUID(),

        patientId,

        examinationDate:
          new Date()
            .toISOString()
            .split("T")[0],

        status:
          "EM_ANDAMENTO",

        teeth,

        deletedAt:
          null,
      });
    }

    const supabase =
      createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Usuário não autenticado."
      );
    }

    /* --------------------------------------------------------
       CRIA EXAME
    -------------------------------------------------------- */

    const {
      data: exam,
      error: examError,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .insert({
          user_id:
            user.id,

          paciente_id:
            patientId,

          data_exame:
            new Date()
              .toISOString()
              .split("T")[0],

          status:
            "EM_ANDAMENTO",
        })
        .select()
        .single();

    if (examError) {
      throw examError;
    }

    /* --------------------------------------------------------
       CRIA OS 32 DENTES
    -------------------------------------------------------- */

    const teethRows =
      TOOTH_NUMBERS.map(
        (number) => ({
          exame_id:
            exam.id,

          numero_dente:
            number,

          status:
            "PRESENTE",

          mobilidade:
            0,

          supuracao:
            false,

          placa:
            false,
        })
      );

    const {
      error: teethError,
    } =
      await supabase
        .from(
          "periodontograma_dentes"
        )
        .insert(
          teethRows
        );

    if (teethError) {
      throw teethError;
    }

    return this.get(
      exam.id
    );
  },

  /* ==========================================================
     ATUALIZAR EXAME
  ========================================================== */

  async update(
    id: string,
    input: Partial<
      PeriodontalExamination
    >
  ): Promise<PeriodontalExamination> {

    if (!isSupabaseConfigured) {

      const updated =
        await localStore.update(
          id,
          input
        );

      return updated;
    }

    const supabase =
      createClient();

    const fields: Record<
      string,
      unknown
    > = {};

    if (
      input.patientId !==
      undefined
    ) {
      fields.paciente_id =
        input.patientId;
    }

    if (
      input.examinationDate !==
      undefined
    ) {
      fields.data_exame =
        input.examinationDate;
    }

    if (
      input.observations !==
      undefined
    ) {
      fields.observacoes =
        input.observations ||
        null;
    }

    if (
      input.diagnosis !==
      undefined
    ) {
      fields.diagnostico =
        input.diagnosis ||
        null;
    }

    if (
      input.status !==
      undefined
    ) {
      fields.status =
        input.status;
    }

    fields.updated_at =
      new Date().toISOString();

    const {
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .update(
          fields
        )
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }

    return this.get(id);
  },

  /* ==========================================================
     ATUALIZAR DENTE
  ========================================================== */

  async updateTooth(
    toothId: string,
    input: Partial<
      PeriodontalTooth
    >
  ): Promise<void> {

    if (!isSupabaseConfigured) {
      return;
    }

    const supabase =
      createClient();

    const fields: Record<
      string,
      unknown
    > = {};

    if (
      input.number !==
      undefined
    ) {
      fields.numero_dente =
        input.number;
    }

    if (
      input.status !==
      undefined
    ) {
      fields.status =
        input.status;
    }

    if (
      input.mobility !==
      undefined
    ) {
      fields.mobilidade =
        input.mobility;
    }

    if (
      input.furcationBuccal !==
      undefined
    ) {
      fields.furca_vestibular =
        input.furcationBuccal;
    }

    if (
      input.furcationLingual !==
      undefined
    ) {
      fields.furca_lingual =
        input.furcationLingual;
    }

    if (
      input.suppuration !==
      undefined
    ) {
      fields.supuracao =
        input.suppuration;
    }

    if (
      input.plaque !==
      undefined
    ) {
      fields.placa =
        input.plaque;
    }

    if (
      input.notes !==
      undefined
    ) {
      fields.observacoes =
        input.notes ||
        null;
    }

    fields.updated_at =
      new Date().toISOString();

    const {
      error,
    } =
      await supabase
        .from(
          "periodontograma_dentes"
        )
        .update(
          fields
        )
        .eq(
          "id",
          toothId
        );

    if (error) {
      throw error;
    }
  },

  /* ==========================================================
     ATUALIZAR SÍTIO PERIODONTAL
  ========================================================== */

  async updateSite(
    site: PeriodontalSite
  ): Promise<PeriodontalSite> {

    if (!isSupabaseConfigured) {
      return site;
    }

    if (!site.toothId) {
      throw new Error(
        "O sítio periodontal precisa de um dente."
      );
    }

    const supabase =
      createClient();

    const row = {
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
        site.bleeding,

      placa:
        site.plaque,

      supuracao:
        site.suppuration,

      observacoes:
        site.notes ||
        null,

      updated_at:
        new Date().toISOString(),
    };

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "periodontograma_sitios"
        )
        .upsert(
          row,
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

    return fromSiteRow(
      data
    );
  },

  /* ==========================================================
     FINALIZAR EXAME
  ========================================================== */

  async finalize(
    id: string
  ): Promise<PeriodontalExamination> {

    return this.update(
      id,
      {
        status:
          "FINALIZADO",
      }
    );
  },

  /* ==========================================================
     EXCLUSÃO LÓGICA
  ========================================================== */

  async softDelete(
    id: string
  ): Promise<void> {

    if (!isSupabaseConfigured) {

      await localStore.softDelete(
        id
      );

      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .update({
          deleted_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }
  },

  /* ==========================================================
     RESTAURAR
  ========================================================== */

  async restore(
    id: string
  ): Promise<void> {

    if (!isSupabaseConfigured) {

      await localStore.restore(
        id
      );

      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from(
          "exames_periodontais"
        )
        .update({
          deleted_at:
            null,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      throw error;
    }
  },
};
