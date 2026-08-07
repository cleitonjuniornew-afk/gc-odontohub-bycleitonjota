import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface Discipline {
  id: string;
  slug: string;
  name: string;
  color: string;
  professor?: string;
  sala?: string;
}


function fromRow(row: any): Discipline {
  return {
    id: row.id,
    slug: row.slug,
    name: row.nome,
    color: row.cor ?? "#D4AF37",
    professor: row.professor ?? undefined,
    sala: row.sala ?? undefined,
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


  async create(input: {
    name: string;
    professor?: string;
    color?: string;
    sala?: string;
  }) {

    const supabase = createClient();


    const { data: { user } } = await supabase.auth.getUser();


    const slug = input.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");


    const { data, error } = await supabase
      .from("disciplinas")
      .insert({
        nome: input.name,
        slug,
        professor: input.professor || null,
        sala: input.sala || null,
        cor: input.color ?? "#D4AF37",
        user_id: user?.id,
      })
      .select()
      .single();


    if (error) throw error;


    return fromRow(data);

  },


};
