/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Repository genérico com soft delete, reutilizado por todas as entidades de
 * domínio (Pacientes, Tarefas, Eventos, Avaliações, Lembretes, Biblioteca,
 * Fotos, Atendimentos). Mantém a regra "nunca excluir definitivamente" e
 * evita duplicar a mesma lógica de CRUD em cada feature.
 *
 * Uso: `export const tasksRepo = createSoftDeleteRepository("tarefas");`
 */
export function createSoftDeleteRepository<Row extends { id: string }>(table: string) {
  function client() {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env."
      );
    }
    return createClient();
  }

  return {
    async list(modify?: (q: any) => any): Promise<Row[]> {
      let query = client().from(table).select("*").is("deleted_at", null);
      if (modify) query = modify(query);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Row[];
    },

    async create(payload: Partial<Row>): Promise<Row> {
      const {
        data: { user },
      } = await client().auth.getUser();
      const { data, error } = await client()
        .from(table)
        .insert({ ...payload, user_id: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as Row;
    },

    async update(id: string, payload: Partial<Row>): Promise<Row> {
      const { data, error } = await client().from(table).update(payload as any).eq("id", id).select().single();
      if (error) throw error;
      return data as Row;
    },

    /** Soft delete — marca deleted_at. Reversível via `restore`. */
    async softDelete(id: string): Promise<void> {
      const { error } = await client().from(table).update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },

    async restore(id: string): Promise<void> {
      const { error } = await client().from(table).update({ deleted_at: null }).eq("id", id);
      if (error) throw error;
    },
  };
}
