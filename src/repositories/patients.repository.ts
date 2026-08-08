/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { patients as seedPatients } from "@/lib/mock-data";

import type {
  Patient,
  PatientProcedure,
} from "@/types";

/*
 * O armazenamento local mantém deletedAt internamente,
 * mas a aplicação trabalha apenas com Patient.
 */
const localStore = createLocalStore(
  seedPatients.map((patient) => ({
    ...patient,
    deletedAt: null as null,
  }))
);

/*
 * Remove o campo interno deletedAt antes de devolver
 * o paciente para o restante da aplicação.
 */
function cleanLocalPatient(
  patient: Awaited<
    ReturnType<typeof localStore.list>
  >[number]
): Patient {
  const {
    deletedAt,
    ...cleanPatient
  } = patient;

  void deletedAt;

  return cleanPatient;
}

/*
 * Converte uma linha de paciente_procedimentos
 * para o formato usado pela aplicação.
 */
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

/*
 * Converte uma linha do Supabase
 * para Patient.
 */
function fromRow(
  row: any
): Patient {
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

/*
 * Converte os campos do frontend
 * para os nomes usados no Supabase.
 */
function patientToRow(
  input: Partial<Patient>
) {
  const row: Record<
    string,
    unknown
  > = {};

  if (
    input.name !==
    undefined
  ) {
    row.nome =
      input.name;
  }

  if (
    input.phone !==
    undefined
  ) {
    row.telefone =
      input.phone ||
      null;
  }

  if (
    input.birthDate !==
    undefined
  ) {
    row.nascimento =
      input.birthDate ||
      null;
  }

  if (
    input.age !==
    undefined
  ) {
    row.idade =
      input.age ??
      null;
  }

  if (
    input.professor !==
    undefined
  ) {
    row.professor =
      input.professor ||
      null;
  }

  if (
    input.nextReturn !==
    undefined
  ) {
    row.proximo_retorno =
      input.nextReturn ||
      null;
  }

  if (
    input.notes !==
    undefined
  ) {
    row.observacoes =
      input.notes ||
      null;
  }

  return row;
}

/*
 * Converte um procedimento para uma linha
 * da tabela paciente_procedimentos.
 */
function procedureToRow(
  procedure: PatientProcedure,
  patientId: string,
  userId?: string
) {
  return {
    id:
      procedure.id,

    paciente_id:
      patientId,

    user_id:
      userId ??
      null,

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

export const patientsRepository = {
  /*
   * LISTAR PACIENTES
   */
  async list(): Promise<Patient[]> {
    /*
     * Modo local
     */
    if (
      !isSupabaseConfigured
    ) {
      const patients =
        await localStore.list();

      return patients.map(
        cleanLocalPatient
      );
    }

    /*
     * Supabase
     */
    const supabase =
      createClient();

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
        .is(
          "deleted_at",
          null
        )
        .order("nome");

    if (error) {
      throw error;
    }

    return (
      data ?? []
    ).map(
      fromRow
    );
  },

  /*
   * BUSCAR UM PACIENTE
   */
  async get(
    id: string
  ): Promise<Patient> {
    /*
     * Modo local.
     *
     * IMPORTANTE:
     * localStore NÃO possui get().
     * Então usamos list() e procuramos pelo id.
     */
    if (
      !isSupabaseConfigured
    ) {
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

      return cleanLocalPatient(
        patient
      );
    }

    /*
     * Supabase
     */
    const supabase =
      createClient();

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

  /*
   * CRIAR PACIENTE
   */
  async create(
    input: Omit<
      Patient,
      "id"
    >
  ): Promise<Patient> {
    /*
     * Modo local
     */
    if (
      !isSupabaseConfigured
    ) {
      const created =
        await localStore.create({
          ...input,

          procedures:
            input.procedures ??
            [],

          deletedAt:
            null as null,
        });

      return cleanLocalPatient(
        created
      );
    }

    /*
     * Supabase
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
     * Cria o paciente.
     */
    const {
      data,
      error,
    } =
      await supabase
        .from("pacientes")
        .insert({
          ...patientToRow(
            input
          ),

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
      input.procedures.length >
        0
    ) {
      const procedureRows =
        input.procedures.map(
          (
            procedure
          ) =>
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

      if (
        procedureError
      ) {
        throw procedureError;
      }
    }

    return {
      ...patient,

      procedures:
        input.procedures ??
        [],
    };
  },

  /*
   * ATUALIZAR PACIENTE
   */
  async update(
    id: string,
    input: Partial<Patient>
  ): Promise<Patient> {
    /*
     * Modo local
     */
    if (
      !isSupabaseConfigured
    ) {
      const updated =
        await localStore.update(
          id,
          input
        );

      return cleanLocalPatient(
        updated
      );
    }

    /*
     * Supabase
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
     * Atualiza os dados principais.
     */
    const patientFields =
      patientToRow(
        input
      );

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
     * Se procedures foi enviado,
     * substitui os procedimentos antigos.
     */
    if (
      input.procedures !==
      undefined
    ) {
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

      if (
        deleteError
      ) {
        throw deleteError;
      }

      if (
        input.procedures.length >
        0
      ) {
        const procedureRows =
          input.procedures.map(
            (
              procedure
            ) =>
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

        if (
          insertError
        ) {
          throw insertError;
        }
      }
    }

    /*
     * Busca novamente o paciente completo.
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

  /*
   * EXCLUSÃO LÓGICA
   */
  async softDelete(
    id: string
  ): Promise<void> {
    /*
     * Modo local
     */
    if (
      !isSupabaseConfigured
    ) {
      await localStore.softDelete(
        id
      );

      return;
    }

    /*
     * Supabase
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

  /*
   * RESTAURAR PACIENTE
   */
  async restore(
    id: string
  ): Promise<void> {
    /*
     * Modo local
     */
    if (
      !isSupabaseConfigured
    ) {
      await localStore.restore(
        id
      );

      return;
    }

    /*
     * Supabase
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
