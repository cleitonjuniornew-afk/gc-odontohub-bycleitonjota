/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores do Supabase */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import type { PatientProcedure } from "@/types";

type LocalRow = PatientProcedure & {
  patientId: string;
  deletedAt?: string | null;
};

const localStore = createLocalStore<LocalRow>([]);

function fromRow(row: any): PatientProcedure {
  return {
    id: row.id,
    procedure: row.procedimento ?? row.procedure ?? "",
    status: row.status ?? "PLANEJADO",
    tooth: row.dente ?? row.tooth ?? undefined,
    region: row.regiao ?? row.region ?? undefined,
    details: row.detalhes ?? row.details ?? undefined,
  };
}

function toRow(
  patientId: string,
  input: Partial<PatientProcedure>
) {
  return {
    paciente_id: patientId,
    procedimento: input.procedure ?? "",
    status: input.status ?? "PLANEJADO",
    dente: input.tooth || null,
    regiao: input.region || null,
    detalhes: input.details || null,
  };
}

export const patientProceduresRepository = {
  async list(
    patientId: string
  ): Promise<PatientProcedure[]> {
    if (!isSupabaseConfigured) {
      const rows = await localStore.list();

      return rows
        .filter(
          (row) =>
            row.patientId === patientId &&
            !row.deletedAt
        )
        .map((row) => ({
          id: row.id,
          procedure: row.procedure,
          status: row.status,
          tooth: row.tooth,
          region: row.region,
          details: row.details,
        }));
    }

    const { data, error } = await createClient()
      .from("paciente_procedimentos")
      .select("*")
      .eq("paciente_id", patientId)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return (data ?? []).map(fromRow);
  },

  async create(
    patientId: string,
    input: Omit<PatientProcedure, "id">
  ): Promise<PatientProcedure> {
    if (!isSupabaseConfigured) {
      const created = await localStore.create({
        patientId,
        deletedAt: null,
        ...input,
      });

      return {
        id: created.id,
        procedure: created.procedure,
        status: created.status,
        tooth: created.tooth,
        region: created.region,
        details: created.details,
      };
    }

    const {
      data: { user },
    } = await createClient().auth.getUser();

    const { data, error } = await createClient()
      .from("paciente_procedimentos")
      .insert({
        ...toRow(patientId, input),
        user_id: user?.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return fromRow(data);
  },

  async update(
    id: string,
    input: Partial<PatientProcedure>
  ): Promise<PatientProcedure> {
    if (!isSupabaseConfigured) {
      const updated = await localStore.update(
        id,
        input
      );

      return {
        id: updated.id,
        procedure: updated.procedure,
        status: updated.status,
        tooth: updated.tooth,
        region: updated.region,
        details: updated.details,
      };
    }

    const row: Record<string, unknown> = {};

    if (input.procedure !== undefined) {
      row.procedimento = input.procedure;
    }

    if (input.status !== undefined) {
      row.status = input.status;
    }

    if (input.tooth !== undefined) {
      row.dente = input.tooth || null;
    }

    if (input.region !== undefined) {
      row.regiao = input.region || null;
    }

    if (input.details !== undefined) {
      row.detalhes = input.details || null;
    }

    const { data, error } = await createClient()
      .from("paciente_procedimentos")
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return fromRow(data);
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      await localStore.softDelete(id);
      return;
    }

    const { error } = await createClient()
      .from("paciente_procedimentos")
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
      await localStore.restore(id);
      return;
    }

    const { error } = await createClient()
      .from("paciente_procedimentos")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  },
};
