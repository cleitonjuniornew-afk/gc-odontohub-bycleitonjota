import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { disciplines, tasks, libraryItems, photos } from "@/lib/mock-data";
import {
  TasksEmptyState,
  LibraryEmptyState,
  PhotosEmptyState,
  GradesEmptyState,
  ObservationsEmptyState,
} from "@/features/disciplinas/components/discipline-empty-states";

export function generateStaticParams() {
  return disciplines.map((d) => ({ slug: d.slug }));
}

export default async function DisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const discipline = disciplines.find((d) => d.slug === slug);
  if (!discipline) notFound();

  const disciplineTasks = tasks.filter((t) => t.disciplineId === discipline.id);
  const disciplineLibrary = libraryItems.filter((l) => l.disciplineId === discipline.id);
  const disciplinePhotos = photos.filter((p) => p.disciplineId === discipline.id);

  return (
    <div>
      <PageHeader
        title={discipline.name}
        description={`Professor(a): ${discipline.professor}`}
      />

      <Tabs defaultValue="resumo">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="biblioteca">Biblioteca</TabsTrigger>
          <TabsTrigger value="fotos">Fotos</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs text-text-secondary">Tarefas pendentes</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {disciplineTasks.filter((t) => !t.done).length}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-text-secondary">Itens na biblioteca</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{disciplineLibrary.length}</p>
            </Card>
            <Card>
              <p className="text-xs text-text-secondary">Fotos registradas</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{disciplinePhotos.length}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tarefas">
          {disciplineTasks.length === 0 ? (
            <TasksEmptyState />
          ) : (
            <div className="space-y-3">
              {disciplineTasks.map((t) => (
                <Card key={t.id} className="flex items-center justify-between py-3.5">
                  <span className={`text-sm ${t.done ? "text-text-muted line-through" : "text-text-primary"}`}>{t.title}</span>
                  <Badge variant={t.priority === "ALTA" ? "error" : t.priority === "MEDIA" ? "warning" : "default"}>{t.priority}</Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="biblioteca">
          {disciplineLibrary.length === 0 ? (
            <LibraryEmptyState />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {disciplineLibrary.map((l) => (
                <Card key={l.id} className="flex items-center gap-3 py-3.5">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">{l.title}</p>
                    <p className="text-xs text-text-muted">{l.type} · {l.subject}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fotos">
          {disciplinePhotos.length === 0 ? (
            <PhotosEmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {disciplinePhotos.map((p) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-[var(--radius-card)] border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.description ?? ""} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notas">
          <GradesEmptyState />
        </TabsContent>

        <TabsContent value="observacoes">
          <ObservationsEmptyState />
        </TabsContent>
      </Tabs>
    </div>
  );
}
