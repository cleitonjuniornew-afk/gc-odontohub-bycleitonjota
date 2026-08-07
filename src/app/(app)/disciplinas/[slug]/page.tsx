import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { disciplinesServerRepository } from "@/repositories/disciplines.server.repository";

import {
  TasksEmptyState,
  LibraryEmptyState,
  PhotosEmptyState,
  GradesEmptyState,
  ObservationsEmptyState,
} from "@/features/disciplinas/components/discipline-empty-states";


export async function generateStaticParams() {
  return [];
}


export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;


  const discipline =
    await disciplinesServerRepository.getBySlug(slug);


  if (!discipline) {
    notFound();
  }


  const disciplineTasks: never[] = [];
  const disciplineLibrary: never[] = [];
  const disciplinePhotos: never[] = [];


  return (
    <div>

      <PageHeader
        title={discipline.name}
        description={
          discipline.professor
            ? `Professor(a): ${discipline.professor}`
            : "Disciplina acadêmica"
        }
      />


      <Tabs defaultValue="resumo">


        <TabsList className="flex-wrap">

          <TabsTrigger value="resumo">
            Resumo
          </TabsTrigger>

          <TabsTrigger value="tarefas">
            Tarefas
          </TabsTrigger>

          <TabsTrigger value="biblioteca">
            Biblioteca
          </TabsTrigger>

          <TabsTrigger value="fotos">
            Fotos
          </TabsTrigger>

          <TabsTrigger value="notas">
            Notas
          </TabsTrigger>

          <TabsTrigger value="observacoes">
            Observações
          </TabsTrigger>

        </TabsList>


        <TabsContent value="resumo">

          <div className="grid gap-4 sm:grid-cols-3">

            <Card>
              <p className="text-xs text-text-secondary">
                Tarefas pendentes
              </p>
              <p className="mt-2 text-2xl font-bold">
                {disciplineTasks.length}
              </p>
            </Card>


            <Card>
              <p className="text-xs text-text-secondary">
                Biblioteca
              </p>
              <p className="mt-2 text-2xl font-bold">
                {disciplineLibrary.length}
              </p>
            </Card>


            <Card>
              <p className="text-xs text-text-secondary">
                Fotos
              </p>
              <p className="mt-2 text-2xl font-bold">
                {disciplinePhotos.length}
              </p>
            </Card>

          </div>

        </TabsContent>


        <TabsContent value="tarefas">
          <TasksEmptyState />
        </TabsContent>


        <TabsContent value="biblioteca">
          <LibraryEmptyState />
        </TabsContent>


        <TabsContent value="fotos">
          <PhotosEmptyState />
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
