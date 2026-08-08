/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { patients as seedPatients } from "@/lib/mock-data";

import type {
  Patient,
  PatientProcedure,
} from "@/types";

type LocalRow = Patient & {
  deletedAt?: string | null;
};

const localStore = createLocalStore(
  seedPatients.map((patient) => ({
    ...patient,
    deletedAt: null,
  }))
);

/* =========================================================
   MAPEADORES
   ========================================================= */

function fromProcedureRow(
  row: any
): PatientProcedure {
  return {
    id: row.id,
    procedure:
      row.procedimento ??
      row.procedure ??
      "",
    status:
      row.status ??
      "PLANEJADO",
    tooth:
      row.dente ??
      row.tooth ??
      undefined,
    region:
      row.regiao ??
      row.region ??
      undefined,
    details:
      row.detalhes ??
      row.details ??
      undefined,
  };
}

function fromRow(row: any): Patient {
  return {
    id: row.id,

    name:
      row.nome ??
      row.name ??
      "",

    age:
      row.idade ??
      row.age ??
      undefined,

    professor:
      row.professor ??
      undefined,

    procedures:
      Array.isArray(
        row.paciente_procedimentos
      )
        ? row.paciente_procedimentos.map(
            fromProcedureRow
          )
        : Array.isArray(
            row.procedimentos
          )
        ? row.procedimentos
        : Array.isArray(
            row.procedures
          )
        ? row.procedures
        : [],

    nextReturn:
      row.proximo_retorno ??
      row.nextReturn ??
      undefined,

    notes:
      row.observacoes ??
      row.notes ??
      undefined,

    phone:
      row.telefone ??
      row.phone ??
      undefined,

    birthDate:
      row.nascimento ??
      row.birthDate ??
      undefined,
  };
}

/* =========================================================
   PACIENTE -> ROW SUPABASE
   ========================================================= */

function patientToRow(
  input: Partial<Patient>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (input.name !== undefined) {
    row.nome = input.name;
  }

  if (input.phone !== undefined) {
    row.telefone =
      input.phone || null;
  }

  if (
    input.birthDate !==
    undefined
  ) {
    row.nascimento =
      input.birthDate || null;
  }

  if (input.age !== undefined) {
    row.idade =
      input.age ?? null;
  }

  if (
    input.professor !==
    undefined
  ) {
    row.professor =
      input.professor || null;
  }

  if (
    input.nextReturn !==
    undefined
  ) {
    row.proximo_retorno =
      input.nextReturn || null;
  }

  if (input.notes !== undefined) {
    row.observacoes =
      input.notes || null;
  }

  return row;
}

/* =========================================================
   PROCEDIMENTO -> ROW SUPABASE
   ========================================================= */

function procedureToRow(
  procedure: PatientProcedure,
  patientId: string,
  userId?: string
) {
  return {
    id: procedure.id,

    paciente_id:
      patientId,

    user_id:
      userId ?? null,

    procedimento:
      procedure.procedure,

    status:
      procedure.status,

    dente:
      procedure.tooth ||
      null,

    regiao:
      procedure.region ||
      null,

    detalhes:
      procedure.details ||
      null,
  };
}

/* =========================================================
   REPOSITÓRIO
   ========================================================= */

export const patientsRepository = {

  /* =======================================================
     LISTAR PACIENTES
     ======================================================= */

  async list(): Promise<Patient[]> {
    if (!isSupabaseConfigured) {
      const patients =
        await localStore.list();

      return patients
        .filter(
          (patient) =>
            !patient.deletedAt
        )
        .map((patient) =>
          fromRow(patient)
        );
    }

    const supabase =
      createClient();

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .select(`
        *,
        paciente_procedimentos (*)
      `)
      .is(
        "deleted_at",
        null
      )
      .order("nome");

    if (error) {
      throw error;
    }

    return (data ?? []).map(
      fromRow
    );
  },

  /* =======================================================
     BUSCAR UM PACIENTE
     ======================================================= */

  async get(
    id: string
  ): Promise<Patient> {

    /*
     * MODO LOCAL
     *
     * createLocalStore não possui .get().
     * Então buscamos pelo list().
     */
    if (!isSupabaseConfigured) {
      const patients =
        await localStore.list();

      const patient =
        patients.find(
          (item) =>
            item.id === id
        );

      if (!patient) {
        throw new Error(
          "Paciente não encontrado."
        );
      }

      return fromRow(patient);
    }

    /*
     * SUPABASE
     */
    const supabase =
      createClient();

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .select(`
        *,
        paciente_procedimentos (*)
      `)
      .eq(
        "id",
        id
      )
      .single();

    if (error) {
      throw error;
    }

    return fromRow(data);
  },

  /* =======================================================
     CRIAR PACIENTE
     ======================================================= */

  async create(
    input: Omit<Patient, "id">
  ): Promise<Patient> {

    /*
     * MODO LOCAL
     */
    if (!isSupabaseConfigured) {
      const created =
        await localStore.create({
          ...input,

          procedures:
            input.procedures ??
            [],
        } as LocalRow);

      return fromRow(created);
    }

    /*
     * SUPABASE
     */
    const supabase =
      createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const {
      data,
      error,
    } = await supabase
      .from("pacientes")
      .insert({
        ...patientToRow(input),

        user_id:
          user?.id ??
          null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const patient =
      fromRow(data);

    /*
     * Salva os procedimentos
     * vinculados ao paciente.
     */
    if (
      input.procedures &&
      input.procedures.length > 0
    ) {
      const procedureRows =
        input.procedures.map(
          (procedure) =>
            procedureToRow(
              procedure,
              patient.id,
              user?.id
            )
        );

      const {
        error:
          procedureError,
      } =
        await supabase
          .from(
            "paciente_procedimentos"
          )
          .insert(
            procedureRows
          );

      if (procedureError) {
        throw procedureError;
      }
    }

    /*
     * Retorna o paciente completo
     * com os procedimentos.
     */
    return {
      ...patient,
      procedures:
        input.procedures ??
        [],
    };
  },

  /* =======================================================
     ATUALIZAR PACIENTE
     ======================================================= */

  async update(
    id: string,
    input: Partial<Patient>
  ): Promise<Patient> {

    /*
     * MODO LOCAL
     */
    if (!isSupabaseConfigured) {
      const updated =
        await localStore.update(
          id,
          input
        );

      return fromRow(updated);
    }

    /*
     * SUPABASE
     */
    const supabase =
      createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    /*
     * Atualiza os dados básicos
     * do paciente.
     */
    const patientFields =
      patientToRow(input);

    if (
      Object.keys(
        patientFields
      ).length > 0
    ) {
      const {
        error,
      } =
        await supabase
          .from("pacientes")
          .update(
            patientFields
          )
          .eq(
            "id",
            id
          );

      if (error) {
        throw error;
      }
    }

    /*
     * Se os procedimentos foram
     * enviados, substituímos a lista
     * pelos procedimentos atuais.
     */
    if (
      input.procedures !==
      undefined
    ) {
      /*
       * Remove os antigos.
       */
      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "paciente_procedimentos"
          )
          .delete()
          .eq(
            "paciente_id",
            id
          );

      if (deleteError) {
        throw deleteError;
      }

      /*
       * Insere os novos.
       */
      if (
        input.procedures.length >
        0
      ) {
        const procedureRows =
          input.procedures.map(
            (procedure) =>
              procedureToRow(
                procedure,
                id,
                user?.id
              )
          );

        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "paciente_procedimentos"
            )
            .insert(
              procedureRows
            );

        if (insertError) {
          throw insertError;
        }
      }
    }

    /*
     * Busca novamente para garantir
     * que retornamos o paciente completo.
     */
    const {
      data,
      error,
    } =
      await supabase
        .from("pacientes")
        .select(`
          *,
          paciente_procedimentos (*)
        `)
        .eq(
          "id",
          id
        )
        .single();

    if (error) {
      throw error;
    }

    return fromRow(data);
  },

  /* =======================================================
     EXCLUIR PACIENTE
     ======================================================= */

  async softDelete(
    id: string
  ): Promise<void> {

    /*
     * MODO LOCAL
     */
    if (!isSupabaseConfigured) {
      await localStore.softDelete(
        id
      );

      return;
    }

    /*
     * SUPABASE
     */
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from("pacientes")
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

  /* =======================================================
     RESTAURAR PACIENTE
     ======================================================= */

  async restore(
    id: string
  ): Promise<void> {

    /*
     * MODO LOCAL
     */
    if (!isSupabaseConfigured) {
      await localStore.restore(
        id
      );

      return;
    }

    /*
     * SUPABASE
     */
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from("pacientes")
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
