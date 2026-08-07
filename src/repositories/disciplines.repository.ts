/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface Discipline {
  id: string;
  slug: string;
  name: string;
  color: string;
  professor?: string;
}

function fromRow(row: any): Discipline {
  return {
    id: row.id,
    slug: row.slug,
    name: row.nome,
    color: row.cor ?? "#D4AF37",
    professor: row.professor ?? undefined,
  };
}

export const disciplinesRepository = {
  async list(): Promise<Discipline[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("disciplinas")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(fromRow);
  },

  async getBySlug(slug: string): Promise<Discipline | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("disciplinas")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;

    return data ? fromRow(data) : null;
  },
};
