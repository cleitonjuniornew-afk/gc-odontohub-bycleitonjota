"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createClient } from "@/lib/supabase/client";

interface Props {
  disciplineId: string;
}

interface LibraryItem {
  id: string;
  titulo: string;
  tipo: string | null;
  professor: string | null;
  assunto: string | null;
  url_arquivo: string | null;
  created_at: string;
}

export function DisciplineLibrary({ disciplineId }: Props) {
  const supabase = createClient();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("PDF");
  const [professor, setProfessor] = useState("");
  const [assunto, setAssunto] = useState("");
  const [urlArquivo, setUrlArquivo] = useState("");

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("biblioteca_itens")
      .select(
        "id, titulo, tipo, professor, assunto, url_arquivo, created_at"
      )
      .eq("disciplina_id", disciplineId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, [disciplineId]);

  async function addItem() {
    if (!titulo.trim()) return;

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("biblioteca_itens").insert({
      user_id: user.id,
      disciplina_id: disciplineId,
      titulo: titulo.trim(),
      tipo,
      professor: professor.trim() || null,
      assunto: assunto.trim() || null,
      url_arquivo: urlArquivo.trim() || null,
    });

    setSaving(false);

    if (error) {
      console.error("Erro ao cadastrar material:", error);
      return;
    }

    setTitulo("");
    setTipo("PDF");
    setProfessor("");
    setAssunto("");
    setUrlArquivo("");
    setOpen(false);

    await loadItems();
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from("biblioteca_itens")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      await loadItems();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Biblioteca da disciplina
          </h2>

          <p className="text-sm text-text-secondary">
            Slides, PDFs, vídeos e outros materiais.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar material
        </Button>
      </div>

      {open && (
        <Card className="space-y-4 p-5">
          <div>
            <label className="text-sm font-medium">
              Título
            </label>

            <Input
              className="mt-1.5"
              placeholder="Ex: Slides de Endodontia"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Tipo
            </label>

            <select
              className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="PDF">PDF</option>
              <option value="SLIDES">Slides</option>
              <option value="VIDEO">Vídeo</option>
              <option value="LINK">Link</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Professor
            </label>

            <Input
              className="mt-1.5"
              placeholder="Nome do professor"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Assunto
            </label>

            <Textarea
              className="mt-1.5"
              placeholder="Assunto ou conteúdo do material"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Link do arquivo (opcional)
            </label>

            <Input
              className="mt-1.5"
              placeholder="https://..."
              value={urlArquivo}
              onChange={(e) => setUrlArquivo(e.target.value)}
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
              onClick={addItem}
              loading={saving}
            >
              Salvar material
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="p-6 text-center text-sm text-text-secondary">
          Carregando materiais...
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-text-muted" />

          <p className="mt-3 text-sm font-medium text-text-primary">
            Nenhum material cadastrado
          </p>

          <p className="mt-1 text-xs text-text-secondary">
            Adicione o primeiro material desta disciplina.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-text-muted" />

                  <h3 className="font-semibold text-text-primary">
                    {item.titulo}
                  </h3>
                </div>

                <div className="mt-2 space-y-1 text-xs text-text-secondary">
                  {item.tipo && <p>Tipo: {item.tipo}</p>}

                  {item.professor && (
                    <p>Professor: {item.professor}</p>
                  )}

                  {item.assunto && (
                    <p>Assunto: {item.assunto}</p>
                  )}

                  {item.url_arquivo && (
                    <a
                      href={item.url_arquivo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-primary underline"
                    >
                      Abrir material
                    </a>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
