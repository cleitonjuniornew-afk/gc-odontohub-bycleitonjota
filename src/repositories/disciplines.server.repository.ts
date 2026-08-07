import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface DisciplineServer {
  id: string;
  slug: string;
  name: string;
  color: string;
  professor?: string;
  sala?: string;
}


function fromRow(row: {
  id: string;
  slug: string;
  nome: string;
  cor?: string | null;
  professor?: string | null;
  sala?: string | null;
}): DisciplineServer {

  return {
    id: row.id,
    slug: row.slug,
    name: row.nome,
    color: row.cor ?? "#D4AF37",
    professor: row.professor ?? undefined,
    sala: row.sala ?? undefined,
  };

}


export const disciplinesServerRepository = {

  async getBySlug(slug: string): Promise<DisciplineServer | null> {

    if (!isSupabaseConfigured) {
      return null;
    }


    const supabase = await createClient();


    const { data, error } = await supabase
      .from("disciplinas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();


    if (error) {
      throw error;
    }


    return data ? fromRow(data) : null;

  },

};
