/* eslint-disable @typescript-eslint/no-explicit-any -- mapeadores de linha do Supabase */
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";
import { photos as seedPhotos, disciplines, patients } from "@/lib/mock-data";
import type { PhotoItem } from "@/types";

type LocalRow = PhotoItem & { deletedAt?: string | null };

const localStore = createLocalStore<LocalRow>(
  seedPhotos.map((p) => ({ ...p, deletedAt: null }))
);

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

function isUuid(value?: string | null): boolean {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export const photosRepository = {
  async list(): Promise<PhotoItem[]> {
    if (!isSupabaseConfigured) {
      return localStore.list();
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("fotos")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(fromRow);
  },

  async upload(
    file: File,
    meta: {
      description?: string;
      phase?: PhotoItem["phase"];
      disciplineId?: string;
      patientId?: string;
      appointmentId?: string;
    }
  ): Promise<PhotoItem> {
    if (!isSupabaseConfigured) {
      return localStore.create({
        ...meta,
        url: URL.createObjectURL(file),
        date: new Date().toISOString(),
      } as LocalRow);
    }

    const supabase = createClient();

    // Verifica o usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    /*
     * DISCIPLINA
     *
     * A interface antiga utiliza IDs como d1, d2, d3.
     * O banco utiliza UUID.
     *
     * Procuramos a disciplina pelo slug e usamos o UUID real.
     */
    let realDisciplineId: string | null = null;

    if (meta.disciplineId) {
      if (isUuid(meta.disciplineId)) {
        realDisciplineId = meta.disciplineId;
      } else {
        const mockDiscipline = disciplines.find(
          (discipline) => discipline.id === meta.disciplineId
        );

        if (mockDiscipline) {
          const { data: discipline, error: disciplineError } =
            await supabase
              .from("disciplinas")
              .select("id")
              .eq("slug", mockDiscipline.slug)
              .maybeSingle();

          if (disciplineError) throw disciplineError;

          realDisciplineId = discipline?.id ?? null;
        }
      }
    }

    /*
     * PACIENTE
     *
     * A interface antiga pode utilizar IDs como pt1, pt2.
     * Se já for UUID, usamos diretamente.
     * Caso seja ID de demonstração, procuramos o paciente pelo nome.
     */
    let realPatientId: string | null = null;

    if (meta.patientId) {
      if (isUuid(meta.patientId)) {
        realPatientId = meta.patientId;
      } else {
        const mockPatient = patients.find(
          (patient) => patient.id === meta.patientId
        );

        if (mockPatient) {
          const { data: patient, error: patientError } = await supabase
            .from("pacientes")
            .select("id")
            .eq("nome", mockPatient.name)
            .maybeSingle();

          if (patientError) throw patientError;

          realPatientId = patient?.id ?? null;
        }
      }
    }

    /*
     * ATENDIMENTO
     *
     * Se futuramente a interface fornecer o UUID real,
     * podemos utilizá-lo diretamente.
     *
     * IDs fictícios como "a1", "atendimento-1", etc.
     * não são enviados para uma coluna UUID.
     */
    let realAppointmentId: string | null = null;

    if (meta.appointmentId && isUuid(meta.appointmentId)) {
      realAppointmentId = meta.appointmentId;
    }

    /*
     * UPLOAD PARA O STORAGE
     */
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("fotos")
      .getPublicUrl(storagePath);

    /*
     * SALVA OS DADOS DA FOTO NO BANCO
     */
    const { data, error } = await supabase
      .from("fotos")
      .insert({
        storage_path: storagePath,
        url_publica: publicUrl,
        descricao: meta.description || null,
        fase: meta.phase || null,
        disciplina_id: realDisciplineId,
        paciente_id: realPatientId,
        atendimento_id: realAppointmentId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Se o banco falhar, remove o arquivo que acabou
      // de ser enviado para não deixar arquivo órfão.
      await supabase.storage
        .from("fotos")
        .remove([storagePath]);

      throw error;
    }

    return fromRow(data);
  },

  async softDelete(
    id: string,
    storagePath?: string
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      return localStore.softDelete(id);
    }

    const supabase = createClient();

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("fotos")
        .remove([storagePath]);

      if (storageError) throw storageError;
    }

    const { error } = await supabase
      .from("fotos")
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
      .from("fotos")
      .update({
        deleted_at: null,
      })
      .eq("id", id);

    if (error) throw error;
  },
};
