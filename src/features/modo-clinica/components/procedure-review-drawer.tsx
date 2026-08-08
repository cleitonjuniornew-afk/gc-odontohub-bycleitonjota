"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckSquare,
  ListOrdered,
  ShieldAlert,
  Target,
  Wrench,
  X,
} from "lucide-react";
import { slideInFromRight } from "@/animations/variants";

interface ProcedureStep {
  ordem?: number;
  titulo?: string;
  descricao?: string;
}

interface ChecklistItem {
  id?: string;
  label?: string;
  done?: boolean;
}

interface MaterialItem {
  nome?: string;
  name?: string;
  quantidade?: number;
  quantity?: number;
}

interface ComplicationItem {
  titulo?: string;
  descricao?: string;
}

interface OrientationItem {
  titulo?: string;
  descricao?: string;
}

interface ProcedureData {
  nome: string;
  descricao?: string | null;
  revisaoTitulo?: string | null;
  revisaoConteudo?: string | null;
  passoAPasso?: ProcedureStep[];
  checklist?: ChecklistItem[];
  materiais?: MaterialItem[];
  complicacoes?: ComplicationItem[];
  orientacoes?: OrientationItem[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure: string;
  procedureData?: ProcedureData | null;
}

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isProfilaxia(procedure: string) {
  return normalizeName(procedure).includes("profilaxia");
}

function isRaspagem(procedure: string) {
  const name = normalizeName(procedure);

  return (
    name.includes("raspagem") ||
    name.includes("alisamento radicular") ||
    name.includes("periodontal")
  );
}

function isRestauracao(procedure: string) {
  const name = normalizeName(procedure);

  return (
    name.includes("restauracao") ||
    name.includes("restauração") ||
    name.includes("classe i") ||
    name.includes("classe ii") ||
    name.includes("classe iii") ||
    name.includes("classe iv") ||
    name.includes("classe v")
  );
}

function isEndodontia(procedure: string) {
  const name = normalizeName(procedure);

  return (
    name.includes("endodont") ||
    name.includes("canal") ||
    name.includes("pulpectomia") ||
    name.includes("tratamento endodontico")
  );
}

function getFallbackContent(procedure: string): ProcedureData {
  if (isProfilaxia(procedure)) {
    return {
      nome: "Profilaxia",
      descricao:
        "Procedimento preventivo destinado ao controle do biofilme, remoção de depósitos e manutenção da saúde periodontal.",
      revisaoTitulo: "Revisão rápida — Profilaxia",
      revisaoConteudo:
        "Revisar avaliação periodontal, presença de biofilme, evidenciação quando indicada, remoção de depósitos, polimento e orientações de higiene.",
      passoAPasso: [
        {
          ordem: 1,
          titulo: "Avaliação inicial",
          descricao:
            "Avaliar condição bucal, presença de biofilme, cálculo, manchas e condições periodontais.",
        },
        {
          ordem: 2,
          titulo: "Evidenciação de biofilme",
          descricao:
            "Realizar evidenciação quando indicada e registrar as áreas de maior acúmulo de biofilme.",
        },
        {
          ordem: 3,
          titulo: "Remoção de biofilme e depósitos",
          descricao:
            "Realizar a remoção dos depósitos presentes utilizando os instrumentos indicados para o caso.",
        },
        {
          ordem: 4,
          titulo: "Polimento",
          descricao:
            "Realizar polimento das superfícies dentárias com pasta profilática e instrumento apropriado.",
        },
        {
          ordem: 5,
          titulo: "Orientação",
          descricao:
            "Orientar o paciente quanto à escovação, higiene interdental e controle de biofilme.",
        },
      ],
      checklist: [
        { id: "avaliacao", label: "Avaliação inicial", done: false },
        {
          id: "evidenciacao",
          label: "Evidenciação de biofilme",
          done: false,
        },
        {
          id: "remocao",
          label: "Remoção de biofilme e depósitos",
          done: false,
        },
        { id: "polimento", label: "Polimento", done: false },
        {
          id: "orientacao",
          label: "Orientação de higiene",
          done: false,
        },
        {
          id: "foto-final",
          label: "Foto final",
          done: false,
        },
      ],
      materiais: [
        { nome: "Evidenciador de biofilme", quantidade: 1 },
        { nome: "Escova de profilaxia", quantidade: 1 },
        { nome: "Pasta profilática", quantidade: 1 },
        { nome: "Fio dental", quantidade: 1 },
        { nome: "Taça de borracha", quantidade: 1 },
      ],
      complicacoes: [
        {
          titulo: "Sensibilidade",
          descricao:
            "Pode ocorrer sensibilidade transitória em pacientes com exposição radicular ou maior sensibilidade dentinária.",
        },
        {
          titulo: "Sangramento gengival",
          descricao:
            "Pode ocorrer em áreas com inflamação gengival ou acúmulo de biofilme.",
        },
      ],
      orientacoes: [
        {
          titulo: "Higiene bucal",
          descricao:
            "Reforçar técnica de escovação e higiene interdental.",
        },
        {
          titulo: "Controle de biofilme",
          descricao:
            "Orientar frequência e técnica adequada de higiene.",
        },
      ],
    };
  }

  if (isRaspagem(procedure)) {
    return {
      nome: procedure,
      descricao:
        "Procedimento periodontal destinado à remoção de cálculo, biofilme e depósitos aderidos, associado ao controle da inflamação periodontal.",
      revisaoTitulo: `Revisão rápida — ${procedure}`,
      revisaoConteudo:
        "Revisar diagnóstico periodontal, profundidade de sondagem, sangramento, cálculo, anatomia radicular, acesso às superfícies e instrumentação indicada para cada região.",
      passoAPasso: [
        {
          ordem: 1,
          titulo: "Avaliação periodontal",
          descricao:
            "Registrar profundidade de sondagem, sangramento, recessão, mobilidade, cálculo e demais achados relevantes.",
        },
        {
          ordem: 2,
          titulo: "Identificação dos depósitos",
          descricao:
            "Identificar localização e extensão de biofilme e cálculo supra e subgengival.",
        },
        {
          ordem: 3,
          titulo: "Instrumentação",
          descricao:
            "Selecionar curetas e/ou instrumentos ultrassônicos de acordo com a região, profundidade e anatomia radicular.",
        },
        {
          ordem: 4,
          titulo: "Curetas específicas",
          descricao:
            "Utilizar Gracey 1/2 e 3/4 em dentes anteriores; 5/6 em pré-molares e anteriores; 7/8 e 9/10 em faces vestibulares e linguais de posteriores; 11/12 e 15/16 em faces mesiais de posteriores; 13/14 em faces distais de posteriores.",
        },
        {
          ordem: 5,
          titulo: "Instrumentação complementar",
          descricao:
            "Utilizar instrumentos Mini Five ou equivalentes quando necessário para bolsas profundas e áreas de difícil acesso.",
        },
        {
          ordem: 6,
          titulo: "Alisamento radicular",
          descricao:
            "Realizar instrumentação cuidadosa buscando remover depósitos e obter superfície radicular biologicamente compatível.",
        },
        {
          ordem: 7,
          titulo: "Reavaliação",
          descricao:
            "Verificar remoção dos depósitos, sangramento e resposta tecidual.",
        },
      ],
      checklist: [
        {
          id: "periodontal",
          label: "Avaliação periodontal registrada",
          done: false,
        },
        {
          id: "sondagem",
          label: "Profundidades de sondagem avaliadas",
          done: false,
        },
        {
          id: "calculo",
          label: "Cálculo identificado",
          done: false,
        },
        {
          id: "gracey",
          label: "Curetas Gracey selecionadas",
          done: false,
        },
        {
          id: "mcalls",
          label: "Curetas McCall selecionadas quando indicadas",
          done: false,
        },
        {
          id: "mini-five",
          label: "Mini Five selecionada para áreas profundas quando indicada",
          done: false,
        },
        {
          id: "instrumentacao",
          label: "Instrumentação realizada",
          done: false,
        },
        {
          id: "reavaliacao",
          label: "Reavaliação realizada",
          done: false,
        },
        {
          id: "orientacao",
          label: "Orientações de higiene realizadas",
          done: false,
        },
      ],
      materiais: [
        { nome: "Cureta Gracey 1/2", quantidade: 1 },
        { nome: "Cureta Gracey 3/4", quantidade: 1 },
        { nome: "Cureta Gracey 5/6", quantidade: 1 },
        { nome: "Cureta Gracey 7/8", quantidade: 1 },
        { nome: "Cureta Gracey 9/10", quantidade: 1 },
        { nome: "Cureta Gracey 11/12", quantidade: 1 },
        { nome: "Cureta Gracey 13/14", quantidade: 1 },
        { nome: "Cureta Gracey 15/16", quantidade: 1 },
        { nome: "Cureta Mini Five", quantidade: 1 },
        { nome: "Cureta McCall", quantidade: 1 },
        { nome: "Sonda periodontal", quantidade: 1 },
        { nome: "Espelho bucal", quantidade: 1 },
        { nome: "Pinça clínica", quantidade: 1 },
      ],
      complicacoes: [
        {
          titulo: "Sensibilidade dentinária",
          descricao:
            "Pode ocorrer após remoção de cálculo e exposição de superfícies radiculares.",
        },
        {
          titulo: "Sangramento",
          descricao:
            "Pode ocorrer em tecidos inflamados durante a instrumentação.",
        },
      ],
      orientacoes: [
        {
          titulo: "Higiene",
          descricao:
            "Orientar escovação e higiene interdental de acordo com a condição periodontal.",
        },
        {
          titulo: "Manutenção",
          descricao:
            "Orientar retorno para manutenção periodontal conforme avaliação clínica.",
        },
      ],
    };
  }

  if (isEndodontia(procedure)) {
    return {
      nome: procedure,
      descricao:
        "Procedimento endodôntico destinado ao tratamento do sistema de canais radiculares conforme diagnóstico pulpar e periapical.",
      revisaoTitulo: `Revisão rápida — ${procedure}`,
      revisaoConteudo:
        "Revisar diagnóstico, anatomia do dente, acesso, odontometria, preparo químico-mecânico, irrigação, medicação quando indicada e obturação.",
      passoAPasso: [
        {
          ordem: 1,
          titulo: "Diagnóstico",
          descricao:
            "Realizar anamnese, testes pulpares e periapicais e avaliação radiográfica.",
        },
        {
          ordem: 2,
          titulo: "Anestesia e isolamento",
          descricao:
            "Realizar anestesia adequada e isolamento absoluto quando indicado.",
        },
        {
          ordem: 3,
          titulo: "Acesso endodôntico",
          descricao:
            "Realizar acesso respeitando a anatomia interna do elemento dentário.",
        },
        {
          ordem: 4,
          titulo: "Odontometria",
          descricao:
            "Determinar o comprimento de trabalho utilizando método e recursos disponíveis.",
        },
        {
          ordem: 5,
          titulo: "Preparo químico-mecânico",
          descricao:
            "Realizar instrumentação e irrigação conforme protocolo adotado.",
        },
        {
          ordem: 6,
          titulo: "Obturação",
          descricao:
            "Obturar os canais após condições clínicas adequadas.",
        },
        {
          ordem: 7,
          titulo: "Controle",
          descricao:
            "Realizar radiografia e registrar o procedimento e orientações.",
        },
      ],
      checklist: [
        { id: "diagnostico", label: "Diagnóstico definido", done: false },
        { id: "anestesia", label: "Anestesia realizada", done: false },
        {
          id: "isolamento",
          label: "Isolamento absoluto realizado",
          done: false,
        },
        { id: "acesso", label: "Acesso realizado", done: false },
        {
          id: "odontometria",
          label: "Odontometria realizada",
          done: false,
        },
        {
          id: "instrumentacao",
          label: "Preparo químico-mecânico realizado",
          done: false,
        },
        {
          id: "irrigacao",
          label: "Irrigação realizada",
          done: false,
        },
        {
          id: "obturação",
          label: "Obturação realizada quando indicada",
          done: false,
        },
        {
          id: "radiografia",
          label: "Controle radiográfico realizado",
          done: false,
        },
      ],
      materiais: [
        { nome: "Espelho bucal", quantidade: 1 },
        { nome: "Pinça clínica", quantidade: 1 },
        { nome: "Sonda exploradora", quantidade: 1 },
        { nome: "Lençol de borracha", quantidade: 1 },
        { nome: "Arco para isolamento", quantidade: 1 },
        { nome: "Limas endodônticas", quantidade: 1 },
        { nome: "Solução irrigadora", quantidade: 1 },
        { nome: "Cones de guta-percha", quantidade: 1 },
      ],
      complicacoes: [
        {
          titulo: "Acidente durante instrumentação",
          descricao:
            "Exige avaliação imediata e documentação adequada da ocorrência.",
        },
        {
          titulo: "Dor pós-operatória",
          descricao:
            "Orientar o paciente e avaliar a causa conforme quadro clínico.",
        },
      ],
      orientacoes: [
        {
          titulo: "Cuidados pós-operatórios",
          descricao:
            "Orientar sobre mastigação, higiene e sinais que exigem retorno.",
        },
      ],
    };
  }

  if (isRestauracao(procedure)) {
    return {
      nome: procedure,
      descricao:
        "Procedimento restaurador adesivo destinado à recuperação de forma, função, contato proximal e estética do elemento dentário.",
      revisaoTitulo: `Revisão rápida — ${procedure}`,
      revisaoConteudo:
        "Revisar diagnóstico, seleção de cor, isolamento, preparo quando indicado, matriz, cunha, condicionamento, sistema adesivo, inserção do material restaurador, fotopolimerização, acabamento, polimento e ajuste oclusal.",
      passoAPasso: [
        {
          ordem: 1,
          titulo: "Diagnóstico e planejamento",
          descricao:
            "Avaliar extensão da lesão, indicação restauradora, contatos, oclusão e condições do elemento.",
        },
        {
          ordem: 2,
          titulo: "Seleção de cor",
          descricao:
            "Selecionar a cor antes do isolamento e da desidratação do elemento.",
        },
        {
          ordem: 3,
          titulo: "Isolamento",
          descricao:
            "Realizar isolamento adequado do campo operatório.",
        },
        {
          ordem: 4,
          titulo: "Matriz e cunha",
          descricao:
            "Utilizar matriz e cunha quando necessárias para reconstrução proximal e obtenção do contato.",
        },
        {
          ordem: 5,
          titulo: "Procedimento adesivo",
          descricao:
            "Realizar condicionamento e aplicação do sistema adesivo conforme fabricante.",
        },
        {
          ordem: 6,
          titulo: "Inserção do compósito",
          descricao:
            "Inserir o material restaurador de maneira controlada e respeitando a anatomia.",
        },
        {
          ordem: 7,
          titulo: "Fotopolimerização",
          descricao:
            "Fotopolimerizar cada incremento conforme orientação do material utilizado.",
        },
        {
          ordem: 8,
          titulo: "Acabamento e polimento",
          descricao:
            "Realizar acabamento, polimento, verificação de contatos e ajuste oclusal.",
        },
      ],
      checklist: [
        {
          id: "diagnostico",
          label: "Diagnóstico e planejamento conferidos",
          done: false,
        },
        {
          id: "cor",
          label: "Cor selecionada antes do isolamento",
          done: false,
        },
        {
          id: "isolamento",
          label: "Isolamento adequado realizado",
          done: false,
        },
        {
          id: "matriz",
          label: "Matriz selecionada quando indicada",
          done: false,
        },
        {
          id: "cunha",
          label: "Cunha selecionada quando indicada",
          done: false,
        },
        {
          id: "adesivo",
          label: "Sistema adesivo aplicado",
          done: false,
        },
        {
          id: "incrementos",
          label: "Incrementos inseridos",
          done: false,
        },
        {
          id: "fotopolimerizacao",
          label: "Fotopolimerização realizada",
          done: false,
        },
        {
          id: "acabamento",
          label: "Acabamento realizado",
          done: false,
        },
        {
          id: "polimento",
          label: "Polimento realizado",
          done: false,
        },
        {
          id: "oclusao",
          label: "Oclusão conferida",
          done: false,
        },
      ],
      materiais: [
        { nome: "Espelho bucal", quantidade: 1 },
        { nome: "Pinça clínica", quantidade: 1 },
        { nome: "Sonda exploradora", quantidade: 1 },
        { nome: "Matriz", quantidade: 1 },
        { nome: "Cunha interdental", quantidade: 1 },
        { nome: "Sistema adesivo", quantidade: 1 },
        { nome: "Resina composta", quantidade: 1 },
        { nome: "Fotopolimerizador", quantidade: 1 },
        { nome: "Discos de acabamento", quantidade: 1 },
        { nome: "Fio dental", quantidade: 1 },
      ],
      complicacoes: [
        {
          titulo: "Sensibilidade pós-operatória",
          descricao:
            "Investigar adaptação, técnica adesiva, oclusão e demais fatores relacionados.",
        },
        {
          titulo: "Excesso proximal",
          descricao:
            "Conferir contato e passagem do fio dental após remoção da matriz.",
        },
      ],
      orientacoes: [
        {
          titulo: "Higiene",
          descricao:
            "Orientar higiene adequada, especialmente na região restaurada.",
        },
        {
          titulo: "Retorno",
          descricao:
            "Orientar retorno caso ocorram dor persistente, sensibilidade ou alteração oclusal.",
        },
      ],
    };
  }

  return {
    nome: procedure,
    descricao:
      "Revisão clínica específica do procedimento selecionado.",
    revisaoTitulo: `Revisão rápida — ${procedure}`,
    revisaoConteudo:
      "Consultar o protocolo clínico cadastrado para este procedimento antes de iniciar o atendimento.",
    passoAPasso: [],
    checklist: [
      {
        id: "materiais",
        label: "Materiais separados",
        done: false,
      },
      {
        id: "avaliacao",
        label: "Avaliação inicial realizada",
        done: false,
      },
      {
        id: "procedimento",
        label: "Procedimento realizado",
        done: false,
      },
      {
        id: "registro",
        label: "Registro clínico realizado",
        done: false,
      },
      {
        id: "orientacao",
        label: "Paciente orientado",
        done: false,
      },
    ],
    materiais: [],
    complicacoes: [],
    orientacoes: [],
  };
}

export function ProcedureReviewDrawer({
  open,
  onOpenChange,
  procedure,
  procedureData,
}: Props) {
  const fallback = getFallbackContent(procedure);

  const data = procedureData ?? fallback;

  const steps = data.passoAPasso ?? [];
  const checklist = data.checklist ?? [];
  const materials = data.materiais ?? [];
  const complications = data.complicacoes ?? [];
  const orientations = data.orientacoes ?? [];

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
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Revisão rápida
                </p>

                <h3 className="mt-1 text-xl font-semibold text-text-primary">
                  {data.nome || procedure}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-card hover:text-text-primary"
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

                <p className="leading-6 text-text-secondary">
                  {data.descricao ||
                    data.revisaoConteudo ||
                    `Revisão clínica de ${data.nome || procedure}.`}
                </p>
              </section>

              {data.revisaoConteudo &&
                data.revisaoConteudo !== data.descricao && (
                  <section>
                    <h4 className="mb-2 font-medium text-text-primary">
                      {data.revisaoTitulo || "Resumo clínico"}
                    </h4>

                    <p className="leading-6 text-text-secondary">
                      {data.revisaoConteudo}
                    </p>
                  </section>
                )}

              {materials.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                    <Wrench className="h-4 w-4 text-primary" />
                    Instrumentais e materiais
                  </h4>

                  <ul className="list-inside list-disc space-y-1 text-text-secondary">
                    {materials.map((material, index) => {
                      const name =
                        material.nome ??
                        material.name ??
                        "Material";

                      const quantity =
                        material.quantidade ??
                        material.quantity;

                      return (
                        <li key={`${name}-${index}`}>
                          {name}
                          {quantity && quantity > 1
                            ? ` — ${quantity}x`
                            : ""}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {steps.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    Passo a passo
                  </h4>

                  <ol className="space-y-3 text-text-secondary">
                    {steps.map((step, index) => (
                      <li
                        key={`${step.titulo ?? "step"}-${index}`}
                        className="flex gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {step.ordem ?? index + 1}
                        </span>

                        <div>
                          <p className="font-medium text-text-primary">
                            {step.titulo || `Etapa ${index + 1}`}
                          </p>

                          {step.descricao && (
                            <p className="mt-1 leading-5 text-text-secondary">
                              {step.descricao}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {orientations.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                    <ShieldAlert className="h-4 w-4 text-secondary" />
                    Cuidados e orientações
                  </h4>

                  <ul className="space-y-3 text-text-secondary">
                    {orientations.map((item, index) => (
                      <li key={`${item.titulo ?? "orientation"}-${index}`}>
                        <p className="font-medium text-text-primary">
                          {item.titulo || "Orientação"}
                        </p>

                        {item.descricao && (
                          <p className="mt-1 leading-5">
                            {item.descricao}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {complications.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Complicações e cuidados
                  </h4>

                  <ul className="space-y-3 text-text-secondary">
                    {complications.map((item, index) => (
                      <li key={`${item.titulo ?? "complication"}-${index}`}>
                        <p className="font-medium text-text-primary">
                          {item.titulo || "Atenção"}
                        </p>

                        {item.descricao && (
                          <p className="mt-1 leading-5">
                            {item.descricao}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {checklist.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-text-primary">
                    <CheckSquare className="h-4 w-4 text-success" />
                    Checklist antes de iniciar
                  </h4>

                  <ul className="space-y-2 text-text-secondary">
                    {checklist.map((item, index) => (
                      <li
                        key={`${item.id ?? "check"}-${index}`}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />

                        <span>{item.label || "Item do checklist"}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
