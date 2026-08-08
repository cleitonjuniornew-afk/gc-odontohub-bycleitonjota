"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

interface Props {
  disciplineId: string;
}

interface LibraryItem {
  id: string;
  titulo: string;
  tipo: string;
  professor?: string | null;
  assunto?: string | null;
  url_arquivo?: string | null;
}

export function DisciplineLibrary({ disciplineId }: Props) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("PDF");
  const [professor, setProfessor] = useState("");
  const [assunto, setAssunto] = useState("");
  const [urlArquivo, setUrlArquivo] = useState("");

  async function loadItems() {
    const { data } = await supabase
      .from("biblioteca_itens")
      .select(
        "id, titulo, tipo, professor, assunto, url_arquivo"
      )
      .eq("disciplina_id", disciplineId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    setItems((data as LibraryItem[]) || []);
  }

  async function addItem() {
    if (!titulo.trim()) return;

    setLoading(true);

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("biblioteca_itens")
      .insert({
        user_id: user.id,
        disciplina_id: disciplineId,
        titulo: titulo.trim(),
        tipo,
        professor: professor.trim() || null,
        assunto: assunto.trim() || null,
        url_arquivo: urlArquivo.trim() || null,
      });

    if (!error) {
      setTitulo("");
      setTipo("PDF");
      setProfessor("");
      setAssunto("");
      setUrlArquivo("");
      setOpen(false);
      await loadItems();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Biblioteca da disciplina
          </h2>

          <p className="text-sm text-muted-foreground">
            Materiais, PDFs, slides e links.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          + Adicionar material
        </Button>
      </div>

      {open && (
        <Card className="space-y-4 p-4">
          <h3 className="font-semibold">
            Novo material
          </h3>

          <Input
            placeholder="Título do material"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <Input
            placeholder="Tipo (PDF, Slide, Vídeo...)"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />

          <Input
            placeholder="Professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
          />

          <Input
            placeholder="Assunto"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
          />

          <Textarea
            placeholder="Link do arquivo ou material (opcional)"
            value={urlArquivo}
            onChange={(e) => setUrlArquivo(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              onClick={addItem}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar material"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Nenhum material cadastrado nesta disciplina.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <h3 className="font-semibold">
                {item.titulo}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.tipo}
                {item.professor
                  ? ` • ${item.professor}`
                  : ""}
              </p>

              {item.assunto && (
                <p className="mt-1 text-sm">
                  {item.assunto}
                </p>
              )}

              {item.url_arquivo && (
                <a
                  href={item.url_arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm underline"
                >
                  Abrir material
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
