/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { libraryItems as seedItems, disciplines } from "@/lib/mock-data";
import type { LibraryItem } from "@/types";

type LocalRow = LibraryItem & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(
  seedItems.map((i) => ({ ...i, deletedAt: null }))
);

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

    const supabase = createClient();

    const {
      data,
      error,
    } = await supabase
      .from("biblioteca_itens")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(fromRow);
  },

  async create(
    input: Omit<LibraryItem, "id" | "date">,
    file?: File
  ): Promise<LibraryItem> {
    if (!isSupabaseConfigured) {
      return localStore.create({
        ...input,
        date: new Date().toISOString(),
        url: file ? URL.createObjectURL(file) : undefined,
      } as LocalRow);
    }

    const supabase = createClient();

    // Usuário atualmente autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    /*
     * O formulário utiliza IDs de demonstração como "d1", "d2", etc.
     * O Supabase, porém, utiliza UUIDs reais na coluna disciplina_id.
     *
     * Primeiro encontramos a disciplina correspondente pelo slug
     * e depois buscamos o UUID real no Supabase.
     */
    let realDisciplineId: string | null = null;

    if (input.disciplineId) {
      const mockDiscipline = disciplines.find(
        (discipline) => discipline.id === input.disciplineId
      );

      if (mockDiscipline) {
        const { data: discipline, error: disciplineError } = await supabase
          .from("disciplinas")
          .select("id")
          .eq("slug", mockDiscipline.slug)
          .maybeSingle();

        if (disciplineError) throw disciplineError;

        realDisciplineId = discipline?.id ?? null;
      } else {
        /*
         * Caso futuramente o formulário já forneça um UUID real,
         * podemos utilizá-lo diretamente.
         */
        realDisciplineId = input.disciplineId;
      }
    }

    // Upload do arquivo para o Storage
    let storagePath: string | null = null;
    let publicUrl: string | null = null;

    if (file) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("biblioteca")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl: generatedPublicUrl },
      } = supabase.storage
        .from("biblioteca")
        .getPublicUrl(storagePath);

      publicUrl = generatedPublicUrl;
    }

    // Salva o material no banco
    const { data, error } = await supabase
      .from("biblioteca_itens")
      .insert({
        titulo: input.title,
        tipo: input.type,
        disciplina_id: realDisciplineId,
        professor: input.professor || null,
        assunto: input.subject || null,
        storage_path: storagePath,
        url_arquivo: publicUrl,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Se o registro não puder ser criado, tenta remover
      // o arquivo que acabou de ser enviado.
      if (storagePath) {
        await supabase.storage
          .from("biblioteca")
          .remove([storagePath]);
      }

      throw error;
    }

    return fromRow(data);
  },

  async softDelete(id: string, storagePath?: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localStore.softDelete(id);
    }

    const supabase = createClient();

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("biblioteca")
        .remove([storagePath]);

      if (storageError) throw storageError;
    }

    const { error } = await supabase
      .from("biblioteca_itens")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return localStore.restore(id);
    }

    const { error } = await createClient()
      .from("biblioteca_itens")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) throw error;
  },
};
