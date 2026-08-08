/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { patients as seedPatients } from "@/lib/mock-data";
import type { Patient, PatientProcedure } from "@/types";

type LocalRow = Patient & {
  deletedAt?: string | null;
};

const localStore = createLocalStore<LocalRow>(
  seedPatients.map((p) => ({
    ...p,
    deletedAt: null,
  }))
);

function fromProcedureRow(row: any): PatientProcedure {
  return {
    id: row.id,
    procedure: row.procedimento ?? row.procedure ?? "",
    status: row.status ?? "PLANEJADO",
    tooth: row.dente ?? row.tooth ?? undefined,
    region: row.regiao ?? row.region ?? undefined,
    details: row.detalhes ?? row.details ?? undefined,
  };
}

function fromRow(row: any): Patient {
  return {
    id: row.id,
    name: row.nome ?? row.name ?? "",
    age: row.idade ?? row.age ?? undefined,
    professor: row.professor ?? undefined,
    procedures: Array.isArray(row.paciente_procedimentos)
      ? row.paciente_procedimentos.map(fromProcedureRow)
      : row.procedimentos ?? row.procedures ?? [],
    nextReturn: row.proximo_retorno ?? row.nextReturn ?? undefined,
    notes: row.observacoes ?? row.notes ?? undefined,
    phone: row.telefone ?? row.phone ?? undefined,
    birthDate: row.nascimento ?? row.birthDate ?? undefined,
  };
}

function patientToRow(input: Partial<Patient>) {
  const row: Record<string, unknown> = {};

  if (input.name !== undefined) {
    row.nome = input.name;
  }

  if (input.phone !== undefined) {
    row.telefone = input.phone || null;
  }

  if (input.birthDate !== undefined) {
    row.nascimento = input.birthDate || null;
  }

  if (input.age !== undefined) {
    row.idade = input.age ?? null;
  }

  if (input.professor !== undefined) {
    row.professor = input.professor || null;
  }

  if (input.nextReturn !== undefined) {
    row.proximo_retorno = input.nextReturn || null;
  }

  if (input.notes !== undefined) {
    row.observacoes = input.notes || null;
  }

  return row;
}

function procedureToRow(
  procedure: PatientProcedure,
  patientId: string,
  userId?: string
) {
  return {
    id: procedure.id,
    paciente_id: patientId,
    user_id: userId ?? null,
    procedimento: procedure.procedure,
    status: procedure.status,
    dente: procedure.tooth || null,
    regiao: procedure.region || null,
    detalhes: procedure.details || null,
  };
}

export const patientsRepository = {
  async list(): Promise<Patient[]> {
    if (!isSupabaseConfigured) {
      return localStore.list();
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("pacientes")
      .select(`
        *,
        paciente_procedimentos (*)
      `)
      .is("deleted_at", null)
      .order("nome");

    if (error) {
      throw error;
    }

    return (data ?? []).map(fromRow);
  },

  async create(input: Omit<Patient, "id">): Promise<Patient> {
    if (!isSupabaseConfigured) {
      return localStore.create({
        ...input,
        procedures: input.procedures ?? [],
      } as LocalRow);
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("pacientes")
      .insert({
        ...patientToRow(input),
        user_id: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const patient = fromRow(data);

    if (input.procedures?.length) {
      const procedureRows = input.procedures.map((procedure) =>
        procedureToRow(procedure, patient.id, user?.id)
      );

      const { error: procedureError } = await supabase
        .from("paciente_procedimentos")
        .insert(procedureRows);

      if (procedureError) {
        throw procedureError;
      }
    }

    return {
      ...patient,
      procedures: input.procedures ?? [],
    };
  },

  async update(
    id: string,
    input: Partial<Patient>
  ): Promise<Patient> {
    if (!isSupabaseConfigured) {
      return localStore.update(
        id,
        input as Partial<LocalRow>
      );
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const patientFields = patientToRow(input);

    if (Object.keys(patientFields).length > 0) {
      const { error } = await supabase
        .from("pacientes")
        .update(patientFields)
        .eq("id", id);

      if (error) {
        throw error;
      }
    }

    if (input.procedures !== undefined) {
      const { error: deleteError } = await supabase
        .from("paciente_procedimentos")
        .delete()
        .eq("paciente_id", id);

      if (deleteError) {
        throw deleteError;
      }

      if (input.procedures.length > 0) {
        const procedureRows = input.procedures.map((procedure) =>
          procedureToRow(procedure, id, user?.id)
        );

        const { error: insertError } = await supabase
          .from("paciente_procedimentos")
          .insert(procedureRows);

        if (insertError) {
          throw insertError;
        }
      }
    }

    const { data, error } = await supabase
      .from("pacientes")
      .select(`
        *,
        paciente_procedimentos (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return fromRow(data);
  },

  async softDelete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localStore.softDelete(id);
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("pacientes")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  },

  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localStore.restore(id);
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("pacientes")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  },
};
