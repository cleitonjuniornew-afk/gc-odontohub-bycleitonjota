"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Wrench, ListOrdered, ShieldAlert, AlertTriangle, CheckSquare } from "lucide-react";
import { slideInFromRight } from "@/animations/variants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: string;
}

// Conteúdo estático de exemplo — estruturado para a IA substituir automaticamente no futuro.
const CONTENT = {
  objective: "Restaurar a função e a estética do dente comprometido, devolvendo o contato proximal e o selamento marginal.",
  instruments: ["Espátula de inserção", "Matriz e cunha interdental", "Fotopolimerizador", "Brocas de acabamento", "Fio dental"],
  steps: [
    "Isolamento absoluto do campo operatório",
    "Remoção do tecido cariado",
    "Condicionamento ácido e sistema adesivo",
    "Inserção incremental do compósito",
    "Fotopolimerização por camada",
    "Acabamento e polimento",
  ],
  care: ["Checar oclusão após a restauração", "Confirmar ausência de excessos proximais", "Orientar sobre sensibilidade pós-operatória"],
  mistakes: ["Contaminação do campo por isolamento inadequado", "Excesso de material na região cervical", "Fotopolimerização insuficiente por camada"],
  checklist: ["Materiais separados", "Matriz e cunha prontas", "Cor do compósito selecionada", "Paciente orientado sobre o procedimento"],
};

export function ProcedureReviewDrawer({ open, onOpenChange, procedure }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            variants={slideInFromRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Revisão rápida</p>
                <h3 className="mt-1 text-lg font-semibold text-text-primary">{procedure}</h3>
              </div>
              <button onClick={() => onOpenChange(false)} className="rounded-full p-1.5 text-text-muted hover:bg-card hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><Target className="h-4 w-4 text-primary" /> Objetivo</h4>
                <p className="text-text-secondary">{CONTENT.objective}</p>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><Wrench className="h-4 w-4 text-primary" /> Instrumentais principais</h4>
                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {CONTENT.instruments.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><ListOrdered className="h-4 w-4 text-primary" /> Passo a passo resumido</h4>
                <ol className="list-inside list-decimal space-y-1 text-text-secondary">
                  {CONTENT.steps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><ShieldAlert className="h-4 w-4 text-secondary" /> Cuidados importantes</h4>
                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {CONTENT.care.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><AlertTriangle className="h-4 w-4 text-warning" /> Erros comuns</h4>
                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {CONTENT.mistakes.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary"><CheckSquare className="h-4 w-4 text-success" /> Checklist final antes de iniciar</h4>
                <ul className="space-y-1.5 text-text-secondary">
                  {CONTENT.checklist.map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" /> {c}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
