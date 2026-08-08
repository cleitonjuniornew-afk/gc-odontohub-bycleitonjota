"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
X,
Target,
Wrench,
ListOrdered,
ShieldAlert,
AlertTriangle,
CheckSquare,
Package,
Camera,
} from "lucide-react";
import { slideInFromRight } from "@/animations/variants";
import {
clinicalProceduresRepository,
type ClinicalProcedure,
} from "@/repositories/clinical-procedures.repository";

interface Props {
open: boolean;
onOpenChange: (open: boolean) => void;
procedure: string;
procedureId?: string | null;
}

export function ProcedureReviewDrawer({
open,
onOpenChange,
procedure,
procedureId,
}: Props) {
const [clinicalProcedure, setClinicalProcedure] =
useState<ClinicalProcedure | null>(null);

const [loading, setLoading] = useState(false);

useEffect(() => {
if (!open) {
return;
}

```
let cancelled = false;

async function loadProcedure() {
  setLoading(true);

  try {
    let result: ClinicalProcedure | null = null;

    /*
     * PRIMEIRA OPÇÃO:
     * usar diretamente o ID do protocolo clínico.
     */
    if (procedureId) {
      result =
        await clinicalProceduresRepository.get(
          procedureId
        );
    }

    /*
     * SEGUNDA OPÇÃO:
     * caso não exista procedureId, procura pelo nome.
     */
    if (!result && procedure) {
      const procedures =
        await clinicalProceduresRepository.list();

      const normalizedName =
        procedure.trim().toLowerCase();

      result =
        procedures.find(
          (item) =>
            item.nome.trim().toLowerCase() ===
            normalizedName
        ) ?? null;
    }

    if (!cancelled) {
      setClinicalProcedure(result);
    }
  } catch (error) {
    console.error(
      "Erro ao carregar revisão do procedimento:",
      error
    );

    if (!cancelled) {
      setClinicalProcedure(null);
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

void loadProcedure();

return () => {
  cancelled = true;
};
```

}, [open, procedure, procedureId]);

const steps =
clinicalProcedure?.passoAPasso ?? [];

const checklist =
clinicalProcedure?.checklist ?? [];

const materials =
clinicalProcedure?.materiais ?? [];

const complications =
clinicalProcedure?.complicacoes ?? [];

const orientations =
clinicalProcedure?.orientacoes ?? [];

const photos =
clinicalProcedure?.fotosNecessarias ?? [];

return ( <AnimatePresence>
{open && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
onClick={() => onOpenChange(false)}
/>

```
      <motion.aside
        variants={slideInFromRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Revisão rápida
            </p>

            <h2 className="mt-1 text-xl font-semibold text-text-primary">
              {clinicalProcedure?.revisaoTitulo ??
                procedure}
            </h2>

            {clinicalProcedure?.disciplina && (
              <p className="mt-1 text-xs text-text-muted">
                {clinicalProcedure.disciplina}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenChange(false)
            }
            className="rounded-full p-1.5 text-text-muted hover:bg-card hover:text-text-primary"
            aria-label="Fechar revisão"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-text-muted">
            Carregando protocolo clínico...
          </div>
        ) : !clinicalProcedure ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">
              Protocolo não encontrado
            </p>

            <p className="mt-1">
              Não foi encontrado um protocolo
              clínico cadastrado para:
            </p>

            <p className="mt-2 font-medium text-primary">
              {procedure}
            </p>
          </div>
        ) : (
          <div className="space-y-7 text-sm">
            {/* DESCRIÇÃO / REVISÃO */}
            {clinicalProcedure.revisaoConteudo && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Target className="h-4 w-4 text-primary" />
                  Revisão
                </h4>

                <p className="leading-relaxed text-text-secondary">
                  {clinicalProcedure.revisaoConteudo}
                </p>
              </section>
            )}

            {/* OBJETIVO / DESCRIÇÃO */}
            {clinicalProcedure.descricao && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Target className="h-4 w-4 text-primary" />
                  Objetivo
                </h4>

                <p className="leading-relaxed text-text-secondary">
                  {clinicalProcedure.descricao}
                </p>
              </section>
            )}

            {/* MATERIAIS */}
            {materials.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Wrench className="h-4 w-4 text-primary" />
                  Instrumentais e materiais
                </h4>

                <ul className="space-y-1.5 text-text-secondary">
                  {materials.map(
                    (material, index) => (
                      <li
                        key={`${material.nome}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />

                        <span>
                          {material.nome}

                          {material.quantidade &&
                            material.quantidade > 1 && (
                              <span className="ml-1 text-text-muted">
                                ×{" "}
                                {material.quantidade}
                              </span>
                            )}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* PASSO A PASSO */}
            {steps.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  Passo a passo
                </h4>

                <ol className="space-y-3 text-text-secondary">
                  {steps
                    .sort(
                      (a, b) =>
                        a.ordem - b.ordem
                    )
                    .map((step) => (
                      <li
                        key={`${step.ordem}-${step.titulo}`}
                        className="flex gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {step.ordem}
                        </span>

                        <div>
                          <p className="font-medium text-text-primary">
                            {step.titulo}
                          </p>

                          {step.descricao && (
                            <p className="mt-0.5 leading-relaxed">
                              {step.descricao}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </section>
            )}

            {/* ORIENTAÇÕES */}
            {orientations.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <ShieldAlert className="h-4 w-4 text-secondary" />
                  Cuidados e orientações
                </h4>

                <ul className="space-y-3 text-text-secondary">
                  {orientations.map(
                    (orientation, index) => (
                      <li
                        key={`${orientation.titulo}-${index}`}
                      >
                        <p className="font-medium text-text-primary">
                          {orientation.titulo}
                        </p>

                        {orientation.descricao && (
                          <p className="mt-0.5 leading-relaxed">
                            {orientation.descricao}
                          </p>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* COMPLICAÇÕES */}
            {complications.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Complicações e atenção
                </h4>

                <ul className="space-y-3 text-text-secondary">
                  {complications.map(
                    (complication, index) => (
                      <li
                        key={`${complication.titulo}-${index}`}
                      >
                        <p className="font-medium text-text-primary">
                          {complication.titulo}
                        </p>

                        {complication.descricao && (
                          <p className="mt-0.5 leading-relaxed">
                            {complication.descricao}
                          </p>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* FOTOS */}
            {photos.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Camera className="h-4 w-4 text-primary" />
                  Fotografias necessárias
                </h4>

                <ul className="space-y-1.5 text-text-secondary">
                  {photos.map(
                    (photo, index) => (
                      <li
                        key={`${photo.fase}-${index}`}
                        className="flex items-center justify-between"
                      >
                        <span className="capitalize">
                          Foto{" "}
                          {photo.fase}
                        </span>

                        {photo.obrigatoria && (
                          <span className="text-xs font-medium text-warning">
                            Obrigatória
                          </span>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

            {/* CHECKLIST */}
            {checklist.length > 0 && (
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <CheckSquare className="h-4 w-4 text-success" />
                  Checklist antes de iniciar
                </h4>

                <ul className="space-y-2 text-text-secondary">
                  {checklist.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />

                      <span>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* TEMPO DE REVISÃO */}
            {clinicalProcedure.tempoRevisao && (
              <div className="border-t border-border pt-4 text-center text-xs text-text-muted">
                Tempo estimado de revisão:{" "}
                {clinicalProcedure.tempoRevisao} min
              </div>
            )}
          </div>
        )}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

);
}
