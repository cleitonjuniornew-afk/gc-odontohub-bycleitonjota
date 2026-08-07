/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { libraryItems as seedItems } from "@/lib/mock-data";
import type { LibraryItem } from "@/types";

type LocalRow = LibraryItem & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(seedItems.map((i) => ({ ...i, deletedAt: null })));

function fromRow(row: any): LibraryItem {
  return {
    id: row.id,
    title: row.titulo ?? row.title,
    type: row.tipo ?? row.type,
    disciplineId: row.disciplina_id ?? row.disciplineId,
    professor: row.professor,
    subject: row.assunto ?? row.subject,
    date: row.created_at ?? row.date ?? new Date().toISOString(),
    url: row.url_arquivo ?? row.url,
    storagePath: row.storage_path,
  };
}

export const libraryRepository = {
  async list(): Promise<LibraryItem[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("biblioteca_itens").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  /** Cria o registro e, se um arquivo real for enviado, faz upload para o
   * bucket `biblioteca` do Supabase Storage (URL pública salva no registro). */
  async create(input: Omit<LibraryItem, "id" | "date">, file?: File): Promise<LibraryItem> {
    if (!isSupabaseConfigured) {
      return localStore.create({ ...input, date: new Date().toISOString(), url: file ? URL.createObjectURL(file) : undefined } as LocalRow);
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let storagePath: string | undefined;
    let publicUrl: string | undefined;

    if (file) {
      storagePath = `${user?.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("biblioteca").upload(storagePath, file);
      if (uploadError) throw uploadError;
      publicUrl = supabase.storage.from("biblioteca").getPublicUrl(storagePath).data.publicUrl;
    }

    const { data, error } = await supabase
      .from("biblioteca_itens")
      .insert({
        titulo: input.title,
        tipo: input.type,
        disciplina_id: input.disciplineId || null,
        professor: input.professor || null,
        assunto: input.subject || null,
        storage_path: storagePath,
        url_arquivo: publicUrl,
        user_id: user?.id,
      })
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async softDelete(id: string, storagePath?: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.softDelete(id);
    const supabase = createClient();
    if (storagePath) await supabase.storage.from("biblioteca").remove([storagePath]);
    const { error } = await supabase.from("biblioteca_itens").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("biblioteca_itens").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
