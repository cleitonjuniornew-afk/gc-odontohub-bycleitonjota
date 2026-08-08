"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createClient } from "@/lib/supabase/client";

interface Props {
  disciplineId: string;
}

interface Photo {
  id: string;
  url_publica: string | null;
  descricao: string | null;
  fase: string | null;
  created_at: string;
}

export function DisciplinePhotos({ disciplineId }: Props) {
  const supabase = createClient();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const [urlPublica, setUrlPublica] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fase, setFase] = useState("");

  async function loadPhotos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos")
      .select(
        "id, url_publica, descricao, fase, created_at"
      )
      .eq("disciplina_id", disciplineId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPhotos();
  }, [disciplineId]);

  async function addPhoto() {
    if (!urlPublica.trim()) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("fotos").insert({
      user_id: user.id,
      disciplina_id: disciplineId,
      url_publica: urlPublica.trim(),
      descricao: descricao.trim() || null,
      fase: fase.trim() || null,
    });

    setSaving(false);

    if (error) {
      console.error("Erro ao cadastrar foto:", error);
      return;
    }

    setUrlPublica("");
    setDescricao("");
    setFase("");
    setOpen(false);

    await loadPhotos();
  }

  async function deletePhoto(id: string) {
    const { error } = await supabase
      .from("fotos")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      await loadPhotos();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Fotos da disciplina
          </h2>

          <p className="text-sm text-text-secondary">
            Registre fotos e imagens relacionadas à disciplina.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar foto
        </Button>
      </div>

      {open && (
        <Card className="space-y-4 p-5">
          <div>
            <label className="text-sm font-medium">
              URL da foto
            </label>

            <Input
              className="mt-1.5"
              placeholder="https://..."
              value={urlPublica}
              onChange={(e) => setUrlPublica(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Descrição
            </label>

            <Textarea
              className="mt-1.5"
              placeholder="Descreva a foto..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Fase
            </label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Antes, durante, depois..."
              value={fase}
              onChange={(e) => setFase(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={addPhoto}
              loading={saving}
            >
              Salvar foto
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-6 text-center text-sm text-text-secondary">
          Carregando fotos...
        </Card>
      ) : photos.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-text-muted" />

          <p className="mt-3 text-sm font-medium text-text-primary">
            Nenhuma foto cadastrada
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            Adicione a primeira foto desta disciplina.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="overflow-hidden"
            >
              {photo.url_publica && (
                <img
                  src={photo.url_publica}
                  alt={photo.descricao || "Foto da disciplina"}
                  className="aspect-video w-full object-cover"
                />
              )}

              <div className="space-y-2 p-4">
                {photo.descricao && (
                  <p className="text-sm text-text-primary">
                    {photo.descricao}
                  </p>
                )}

                {photo.fase && (
                  <p className="text-xs text-text-secondary">
                    Fase: {photo.fase}
                  </p>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePhoto(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
