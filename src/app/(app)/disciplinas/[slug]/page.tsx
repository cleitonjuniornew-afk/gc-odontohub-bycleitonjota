import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { disciplinesServerRepository } from "@/repositories/disciplines.server.repository";

import { DisciplineTasks } from "@/features/disciplinas/components/discipline-tasks";
import { DisciplineLibrary } from "@/features/disciplinas/components/discipline-library";
import { DisciplinePhotos } from "@/features/disciplinas/components/discipline-photos";
import { DisciplineObservations } from "@/features/disciplinas/components/discipline-observations";

import {
  GradesEmptyState,
} from "@/features/disciplinas/components/discipline-empty-states";


export const dynamic = "force-dynamic";


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

    <div className="space-y-6">


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




        <TabsContent value="resumo" className="space-y-4">


          <div className="grid gap-4 md:grid-cols-2">


            <Card className="p-4">


              <h3 className="font-semibold text-text-primary">
                Informações da disciplina
              </h3>


              <div className="mt-4 space-y-2 text-sm">


                <p>
                  <strong>Professor:</strong>{" "}
                  {discipline.professor || "Não informado"}
                </p>


                <p>
                  <strong>Sala:</strong>{" "}
                  {discipline.sala || "Não informado"}
                </p>


                <p>
                  <strong>Dia da aula:</strong>{" "}
                  {discipline.dia_aula || "Não informado"}
                </p>


                <p>
                  <strong>Horário:</strong>{" "}
                  {discipline.horario || "Não informado"}
                </p>


              </div>


            </Card>




            <Card className="p-4">


              <h3 className="font-semibold text-text-primary">
                Sobre a disciplina
              </h3>


              <p className="mt-4 text-sm text-text-secondary">

                {discipline.descricao ||
                  "Nenhuma descrição cadastrada."}

              </p>


            </Card>


          </div>




          <div className="grid gap-4 sm:grid-cols-3">


            <Card className="p-4">

              <p className="text-xs text-text-secondary">
                Tarefas
              </p>

              <p className="mt-2 text-2xl font-bold">
                {disciplineTasks.length}
              </p>

            </Card>




            <Card className="p-4">

              <p className="text-xs text-text-secondary">
                Biblioteca
              </p>

              <p className="mt-2 text-2xl font-bold">
                {disciplineLibrary.length}
              </p>

            </Card>




            <Card className="p-4">

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


          <DisciplineTasks
            disciplineId={discipline.id}
          />


        </TabsContent>





        <TabsContent value="biblioteca">


          <DisciplineLibrary
            disciplineId={discipline.id}
          />


        </TabsContent>





        <TabsContent value="fotos">


          <DisciplinePhotos
            disciplineId={discipline.id}
          />


        </TabsContent>





        <TabsContent value="notas">


          <GradesEmptyState />


        </TabsContent>





        <TabsContent value="observacoes">


          <DisciplineObservations
            disciplineId={discipline.id}
          />


        </TabsContent>




      </Tabs>


    </div>

  );

}
