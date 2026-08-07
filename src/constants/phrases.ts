/**
 * Banco de frases motivacionais do GC OdontoHub.
 * Regra: nunca repetir em dias consecutivos — rotação sem repetição
 * até esgotar todas as frases da lista (ver src/lib/daily-phrase.ts).
 */

export interface Frase {
  texto: string;
  categoria:
    | "motivacao"
    | "odontologia"
    | "disciplina"
    | "persistencia"
    | "clinica"
    | "estudos"
    | "sucesso";
}

export const FRASES: Frase[] = [
  // Motivação
  { texto: "Cada paciente começa com um estudante dedicado.", categoria: "motivacao" },
  { texto: "Você não está apenas estudando Odontologia. Está construindo uma carreira.", categoria: "motivacao" },
  { texto: "Seu conhecimento de hoje será o sorriso de alguém amanhã.", categoria: "motivacao" },
  { texto: "O esforço silencioso de hoje é o resultado visível de amanhã.", categoria: "motivacao" },
  { texto: "Todo especialista já foi, um dia, um iniciante atento.", categoria: "motivacao" },
  { texto: "Sua evolução não precisa ser rápida. Precisa ser constante.", categoria: "motivacao" },
  { texto: "O que parece pequeno hoje sustenta o que será grande amanhã.", categoria: "motivacao" },
  { texto: "Continue. O progresso raramente é visível todos os dias.", categoria: "motivacao" },
  { texto: "Cada aula assistida com atenção é um paciente mais bem cuidado no futuro.", categoria: "motivacao" },
  { texto: "Você está mais perto do consultório do que estava ontem.", categoria: "motivacao" },
  { texto: "Sua dedicação de hoje é invisível, mas nunca é em vão.", categoria: "motivacao" },
  { texto: "Ninguém vê as horas de estudo. Todos verão o resultado.", categoria: "motivacao" },
  { texto: "Grandes profissionais são feitos de pequenas rotinas bem cumpridas.", categoria: "motivacao" },
  { texto: "O cansaço de hoje é o preço da competência de amanhã.", categoria: "motivacao" },

  // Odontologia
  { texto: "O melhor tratamento começa com um bom diagnóstico.", categoria: "odontologia" },
  { texto: "As melhores restaurações começam com um bom planejamento.", categoria: "odontologia" },
  { texto: "Seu paciente do futuro agradecerá pelo estudo de hoje.", categoria: "odontologia" },
  { texto: "Anatomia bem estudada hoje evita improviso na cadeira amanhã.", categoria: "odontologia" },
  { texto: "Toda radiografia bem interpretada é um diagnóstico mais seguro.", categoria: "odontologia" },
  { texto: "Boa técnica nasce de repetição consciente, não de pressa.", categoria: "odontologia" },
  { texto: "Um plano de tratamento sólido começa numa boa anamnese.", categoria: "odontologia" },
  { texto: "Cada procedimento clínico é também uma aula sobre você mesmo.", categoria: "odontologia" },
  { texto: "Excelência clínica se constrói na cadeira e na mesa de estudos.", categoria: "odontologia" },
  { texto: "Dominar a base evita improviso na hora da urgência.", categoria: "odontologia" },
  { texto: "O bom cirurgião-dentista nunca deixa de estudar o básico.", categoria: "odontologia" },
  { texto: "Cada caso clínico observado hoje vira intuição clínica amanhã.", categoria: "odontologia" },

  // Disciplina
  { texto: "Disciplina vence talento quando o talento não se disciplina.", categoria: "disciplina" },
  { texto: "Disciplina é estudar mesmo quando ninguém está vendo.", categoria: "disciplina" },
  { texto: "As pequenas revisões de hoje evitam grandes arrependimentos amanhã.", categoria: "disciplina" },
  { texto: "Rotina não é prisão. É liberdade construída aos poucos.", categoria: "disciplina" },
  { texto: "Constância vale mais do que intensidade ocasional.", categoria: "disciplina" },
  { texto: "Quem estuda todos os dias não precisa correr na véspera.", categoria: "disciplina" },
  { texto: "Disciplina é a ponte entre metas e resultados.", categoria: "disciplina" },
  { texto: "Fazer o combinado com você mesmo é o primeiro compromisso do dia.", categoria: "disciplina" },
  { texto: "O hábito de hoje é o profissional de amanhã.", categoria: "disciplina" },
  { texto: "Organização é uma forma silenciosa de disciplina.", categoria: "disciplina" },
  { texto: "Feito é melhor que perfeito, mas constante é melhor que os dois.", categoria: "disciplina" },

  // Persistência
  { texto: "As maiores aprovações começam com uma revisão.", categoria: "persistencia" },
  { texto: "Persistir é continuar mesmo no dia em que o rendimento parece baixo.", categoria: "persistencia" },
  { texto: "Cada dificuldade superada hoje vira segurança amanhã.", categoria: "persistencia" },
  { texto: "Não desista na parte difícil. É nela que você mais aprende.", categoria: "persistencia" },
  { texto: "Insistir com método é diferente de insistir sem direção. Escolha o método.", categoria: "persistencia" },
  { texto: "Todo estudante teve um dia difícil antes de um dia bom.", categoria: "persistencia" },
  { texto: "O cansaço passa. O que você aprendeu, fica.", categoria: "persistencia" },
  { texto: "Continuar depois de um erro é mais importante do que não errar.", categoria: "persistencia" },
  { texto: "Sua versão de daqui a um ano agradece a sua persistência de hoje.", categoria: "persistencia" },

  // Clínica
  { texto: "Cada atendimento é uma aula que nenhum livro ensina.", categoria: "clinica" },
  { texto: "Prepare-se antes, execute com calma, registre depois.", categoria: "clinica" },
  { texto: "Um bom atendimento começa na organização dos materiais.", categoria: "clinica" },
  { texto: "A calma na cadeira nasce da preparação fora dela.", categoria: "clinica" },
  { texto: "Registrar o aprendizado de cada clínica é estudar duas vezes.", categoria: "clinica" },
  { texto: "Cada checklist seguido corretamente protege você e o paciente.", categoria: "clinica" },
  { texto: "O cuidado com os detalhes é o que separa bom de excelente.", categoria: "clinica" },
  { texto: "Sua postura clínica de hoje é o seu currículo de amanhã.", categoria: "clinica" },

  // Estudos
  { texto: "Pequenos estudos diários constroem grandes profissionais.", categoria: "estudos" },
  { texto: "Cada resumo escrito hoje economiza horas antes da prova.", categoria: "estudos" },
  { texto: "Estudar com foco por 40 minutos vale mais que 3 horas distraído.", categoria: "estudos" },
  { texto: "Revisar é tão importante quanto aprender pela primeira vez.", categoria: "estudos" },
  { texto: "Grandes dentistas nunca param de aprender.", categoria: "estudos" },
  { texto: "Organizar o material de estudo é o primeiro passo para entendê-lo.", categoria: "estudos" },
  { texto: "Ensinar o que você aprendeu é a prova real de que aprendeu.", categoria: "estudos" },
  { texto: "Estudar todos os dias, mesmo pouco, muda tudo no fim do semestre.", categoria: "estudos" },
  { texto: "Fichar um conteúdo bem é economizar tempo no futuro-eu.", categoria: "estudos" },
  { texto: "A dúvida de hoje anotada é a pergunta certa de amanhã.", categoria: "estudos" },
  { texto: "Aprender com profundidade vale mais que decorar com pressa.", categoria: "estudos" },

  // Sucesso
  { texto: "Sucesso é a soma de pequenas disciplinas repetidas todos os dias.", categoria: "sucesso" },
  { texto: "Você está construindo, tijolo por tijolo, a carreira que quer ter.", categoria: "sucesso" },
  { texto: "O profissional de excelência começa no estudante de excelência.", categoria: "sucesso" },
  { texto: "Excelência não é um evento. É uma rotina.", categoria: "sucesso" },
  { texto: "Cada meta cumprida hoje é um degrau real até o consultório dos sonhos.", categoria: "sucesso" },
  { texto: "Você não precisa ser o mais rápido. Precisa ser o mais constante.", categoria: "sucesso" },
  { texto: "O seu eu do futuro está sendo construído pelas escolhas de hoje.", categoria: "sucesso" },
];
