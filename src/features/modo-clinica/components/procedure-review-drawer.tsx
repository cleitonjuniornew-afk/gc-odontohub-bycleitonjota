"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Wrench,
  ListOrdered,
  ShieldAlert,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { slideInFromRight } from "@/animations/variants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: string;
}

interface ProcedureContent {
  objective: string;
  instruments: string[];
  steps: string[];
  care: string[];
  mistakes: string[];
  checklist: string[];
}

const DEFAULT_CONTENT: ProcedureContent = {
  objective:
    "Revisar os principais cuidados, materiais e etapas relacionados ao procedimento clínico selecionado.",

  instruments: [
    "Instrumentais específicos do procedimento",
    "Materiais clínicos necessários",
    "Equipamentos de proteção individual",
  ],

  steps: [
    "Confirmar o procedimento e o planejamento clínico",
    "Separar os materiais e instrumentais necessários",
    "Preparar o paciente e o campo operatório",
    "Realizar o procedimento conforme o protocolo clínico",
    "Conferir o resultado e registrar as informações do atendimento",
  ],

  care: [
    "Confirmar o planejamento antes de iniciar",
    "Manter técnica e biossegurança adequadas",
    "Registrar intercorrências e observações clínicas",
  ],

  mistakes: [
    "Iniciar sem conferir os materiais necessários",
    "Não seguir a sequência adequada do procedimento",
    "Deixar de registrar informações importantes do atendimento",
  ],

  checklist: [
    "Materiais separados",
    "Instrumentais conferidos",
    "Paciente preparado",
    "Procedimento confirmado",
  ],
};

const PROCEDURE_CONTENT: Record<string, ProcedureContent> = {
  profilaxia: {
    objective:
      "Remover biofilme, manchas e depósitos superficiais, contribuindo para a manutenção da saúde periodontal e da higiene bucal.",

    instruments: [
      "Espelho clínico",
      "Sonda exploradora",
      "Taça de borracha ou escova de Robinson",
      "Pasta profilática",
      "Fio dental",
      "Ejetor de saliva",
    ],

    steps: [
      "Avaliação inicial da condição bucal",
      "Identificação de biofilme e manchas extrínsecas",
      "Realização da profilaxia com instrumento rotatório e pasta profilática",
      "Uso do fio dental nas regiões interproximais",
      "Remoção de resíduos e conferência das superfícies dentárias",
      "Orientação de higiene bucal ao paciente",
    ],

    care: [
      "Evitar pressão excessiva durante o polimento",
      "Observar regiões com sensibilidade ou alterações gengivais",
      "Utilizar técnica adequada para cada superfície dentária",
      "Orientar o paciente sobre higiene bucal após o procedimento",
    ],

    mistakes: [
      "Pressão excessiva durante o polimento",
      "Deixar biofilme ou manchas em regiões de difícil acesso",
      "Não realizar higiene das regiões interproximais",
      "Não orientar o paciente após o procedimento",
    ],

    checklist: [
      "Materiais e instrumentais separados",
      "Pasta profilática disponível",
      "Taça de borracha ou escova de Robinson pronta",
      "Fio dental disponível",
      "Paciente orientado sobre o procedimento",
    ],
  },

  "restauracao classe ii": {
    objective:
      "Restaurar a função e a anatomia do dente comprometido, devolvendo o contato proximal e o selamento marginal.",

    instruments: [
      "Espátula de inserção",
      "Matriz e cunha interdental",
      "Fotopolimerizador",
      "Brocas de acabamento",
      "Fio dental",
    ],

    steps: [
      "Isolamento adequado do campo operatório",
      "Remoção do tecido cariado",
      "Condicionamento ácido e aplicação do sistema adesivo",
      "Inserção incremental do compósito",
      "Fotopolimerização por camada",
      "Acabamento e polimento",
    ],

    care: [
      "Checar a oclusão após a restauração",
      "Confirmar ausência de excessos proximais",
      "Verificar o contato proximal com fio dental",
      "Orientar sobre possível sensibilidade pós-operatória",
    ],

    mistakes: [
      "Contaminação do campo operatório",
      "Excesso de material na região cervical",
      "Fotopolimerização insuficiente",
      "Contato proximal inadequado",
    ],

    checklist: [
      "Materiais separados",
      "Matriz e cunha prontas",
      "Cor do compósito selecionada",
      "Fotopolimerizador conferido",
      "Paciente orientado sobre o procedimento",
    ],
  },

  exodontia: {
    objective:
      "Realizar a remoção do elemento dentário indicado de forma planejada, segura e atraumática, respeitando os princípios cirúrgicos.",

    instruments: [
      "Espelho clínico",
      "Descolador",
      "Sindesmótomo",
      "Alavancas",
      "Fórceps adequado ao elemento",
      "Cureta alveolar",
      "Gaze estéril",
    ],

    steps: [
      "Avaliação clínica e confirmação do elemento dentário",
      "Preparo do campo operatório",
      "Anestesia local",
      "Sindesmotomia e/ou luxação conforme indicação",
      "Remoção do elemento dentário",
      "Inspeção e limpeza do alvéolo",
      "Hemostasia e orientações pós-operatórias",
    ],

    care: [
      "Confirmar o elemento dentário antes do procedimento",
      "Avaliar condições clínicas e radiográficas",
      "Manter técnica cirúrgica e biossegurança adequadas",
      "Orientar corretamente os cuidados pós-operatórios",
    ],

    mistakes: [
      "Não confirmar o elemento antes da exodontia",
      "Aplicar força excessiva ou inadequada",
      "Não inspecionar o alvéolo após a remoção",
      "Orientações pós-operatórias incompletas",
    ],

    checklist: [
      "Instrumentais separados",
      "Fórceps adequado conferido",
      "Anestésico e materiais disponíveis",
      "Gazes disponíveis",
      "Orientações pós-operatórias preparadas",
    ],
  },

  raspagem: {
    objective:
      "Remover biofilme e cálculo dental, contribuindo para o controle da inflamação periodontal e manutenção da saúde dos tecidos periodontais.",

    instruments: [
      "Espelho clínico",
      "Sonda periodontal",
      "Curetas periodontais",
      "Ultrassom periodontal, quando indicado",
      "Gaze",
      "Fio dental",
    ],

    steps: [
      "Avaliação periodontal inicial",
      "Identificação das áreas com cálculo e biofilme",
      "Remoção dos depósitos por instrumentação",
      "Reavaliação das superfícies tratadas",
      "Polimento quando indicado",
      "Orientação de higiene bucal",
    ],

    care: [
      "Respeitar a anatomia periodontal",
      "Evitar trauma desnecessário aos tecidos",
      "Observar sangramento e sensibilidade",
      "Reforçar as orientações de higiene bucal",
    ],

    mistakes: [
      "Deixar cálculo residual",
      "Aplicar força excessiva",
      "Não avaliar todas as superfícies",
      "Não orientar adequadamente o paciente",
    ],

    checklist: [
      "Instrumentais periodontais separados",
      "Sonda periodontal disponível",
      "Curetas selecionadas",
      "Materiais de biossegurança conferidos",
      "Paciente orientado",
    ],
  },
};

function normalizeProcedure(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getProcedureContent(procedure: string): ProcedureContent {
  const normalized = normalizeProcedure(procedure);

  if (PROCEDURE_CONTENT[normalized]) {
    return PROCEDURE_CONTENT[normalized];
  }

  if (
    normalized.includes("profilax") ||
    normalized.includes("limpeza")
  ) {
    return PROCEDURE_CONTENT.profilaxia;
  }

  if (
    normalized.includes("classe ii") ||
    normalized.includes("classe 2") ||
    normalized.includes("restauracao")
  ) {
    return PROCEDURE_CONTENT["restauracao classe ii"];
  }

  if (normalized.includes("exodont")) {
    return PROCEDURE_CONTENT.exodontia;
  }

  if (
    normalized.includes("raspagem") ||
    normalized.includes("periodontal")
  ) {
    return PROCEDURE_CONTENT.raspagem;
  }

  return DEFAULT_CONTENT;
}

export function ProcedureReviewDrawer({
  open,
  onOpenChange,
  procedure,
}: Props) {
  const content = getProcedureContent(procedure);

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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Revisão rápida
                </p>

                <h3 className="mt-1 text-xl font-semibold text-text-primary">
                  {procedure}
                </h3>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="rounded-full p-1.5 text-text-muted hover:bg-card hover:text-text-primary"
                aria-label="Fechar revisão"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Target className="h-4 w-4 text-primary" />
                  Objetivo
                </h4>

                <p className="text-text-secondary">
                  {content.objective}
                </p>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <Wrench className="h-4 w-4 text-primary" />
                  Instrumentais principais
                </h4>

                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {content.instruments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <ListOrdered className="h-4 w-4 text-primary" />
                  Passo a passo resumido
                </h4>

                <ol className="list-inside list-decimal space-y-1 text-text-secondary">
                  {content.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <ShieldAlert className="h-4 w-4 text-secondary" />
                  Cuidados importantes
                </h4>

                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {content.care.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Erros comuns
                </h4>

                <ul className="list-inside list-disc space-y-1 text-text-secondary">
                  {content.mistakes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                  <CheckSquare className="h-4 w-4 text-success" />
                  Checklist final antes de iniciar
                </h4>

                <ul className="space-y-1.5 text-text-secondary">
                  {content.checklist.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {item}
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
