/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase (formato dinâmico do banco) */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { photos as seedPhotos } from "@/lib/mock-data";
import type { PhotoItem } from "@/types";

type LocalRow = PhotoItem & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(seedPhotos.map((p) => ({ ...p, deletedAt: null })));

function fromRow(row: any): PhotoItem {
  return {
    id: row.id,
    url: row.url_publica ?? row.url,
    description: row.descricao ?? row.description,
    phase: row.fase ?? row.phase,
    disciplineId: row.disciplina_id ?? row.disciplineId,
    date: row.created_at ?? row.date ?? new Date().toISOString(),
    storagePath: row.storage_path,
    patientId: row.paciente_id ?? row.patientId,
    appointmentId: row.atendimento_id ?? row.appointmentId,
  };
}

export const photosRepository = {
  async list(): Promise<PhotoItem[]> {
    if (!isSupabaseConfigured) return localStore.list();
    const { data, error } = await createClient().from("fotos").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  async upload(
    file: File,
    meta: { description?: string; phase?: PhotoItem["phase"]; disciplineId?: string; patientId?: string; appointmentId?: string }
  ): Promise<PhotoItem> {
    if (!isSupabaseConfigured) {
      return localStore.create({ ...meta, url: URL.createObjectURL(file), date: new Date().toISOString() } as LocalRow);
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const storagePath = `${user?.id}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("fotos").upload(storagePath, file);
    if (uploadError) throw uploadError;
    const publicUrl = supabase.storage.from("fotos").getPublicUrl(storagePath).data.publicUrl;

    const { data, error } = await supabase
      .from("fotos")
      .insert({
        storage_path: storagePath,
        url_publica: publicUrl,
        descricao: meta.description || null,
        fase: meta.phase || null,
        disciplina_id: meta.disciplineId || null,
        paciente_id: meta.patientId || null,
        atendimento_id: meta.appointmentId || null,
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
    if (storagePath) await supabase.storage.from("fotos").remove([storagePath]);
    const { error } = await supabase.from("fotos").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async restore(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localStore.restore(id);
    const { error } = await createClient().from("fotos").update({ deleted_at: null }).eq("id", id);
    if (error) throw error;
  },
};
