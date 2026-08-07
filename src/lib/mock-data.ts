// ==========================================================
// Dados mockados do MVP — atrás da camada de Services/Repository.
// Trocar por chamadas Prisma/Supabase reais sem alterar os componentes:
// basta reimplementar os arquivos em src/repositories mantendo a mesma
// assinatura de função.
// ==========================================================
import type {
  Task, Discipline, AgendaEvent, Grade, LibraryItem,
  PhotoItem, Patient, WeeklyGoal,
} from "@/types";

export const disciplines: Discipline[] = [
  { id: "d1", slug: "dentistica-periodontia", name: "Integrativa Dentística / Periodontia", color: "#D4AF37", professor: "Dra. Ana Militão" },
  { id: "d2", slug: "cirurgia-1", name: "Cirurgia I", color: "#00BFFF", professor: "Dr. Rafael Souza" },
  { id: "d3", slug: "endodontia-1", name: "Endodontia I", color: "#22C55E", professor: "Dra. Camila Prado" },
  { id: "d4", slug: "semiologia", name: "Semiologia", color: "#F59E0B", professor: "Dr. Bruno Alencar" },
  { id: "d5", slug: "oclusao", name: "Oclusão", color: "#EF4444", professor: "Dra. Helena Vaz" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Revisar cronograma de Endodontia I", done: false, priority: "ALTA", dueDate: "2026-08-05", disciplineId: "d3" },
  { id: "t2", title: "Montar resumo de Semiologia — Cap. 4", done: false, priority: "MEDIA", dueDate: "2026-08-05", disciplineId: "d4" },
  { id: "t3", title: "Separar materiais da clínica de amanhã", done: false, priority: "ALTA", dueDate: "2026-08-04", disciplineId: "d1" },
  { id: "t4", title: "Responder lista de Oclusão", done: true, priority: "BAIXA", dueDate: "2026-08-03", disciplineId: "d5" },
  { id: "t5", title: "Organizar fotos do último atendimento", done: false, priority: "BAIXA", dueDate: "2026-08-06", disciplineId: "d1" },
];

export const events: AgendaEvent[] = [
  { id: "e1", title: "Prova de Semiologia", type: "prova", color: "#EF4444", start: "2026-08-10T08:00:00" },
  { id: "e2", title: "Clínica Integrada", type: "clinica", color: "#D4AF37", start: "2026-08-05T13:00:00" },
  { id: "e3", title: "Aula de Cirurgia I", type: "aula", color: "#00BFFF", start: "2026-08-04T19:00:00" },
  { id: "e4", title: "Entrega do relatório de Endodontia", type: "evento", color: "#22C55E", start: "2026-08-07T23:59:00" },
];

export const grades: Grade[] = [
  { id: "g1", disciplineId: "d4", name: "Prova 1", weight: 4, maxValue: 10, score: 8.5, date: "2026-05-10" },
  { id: "g2", disciplineId: "d4", name: "Trabalho", weight: 2, maxValue: 10, score: 9, date: "2026-06-02" },
  { id: "g3", disciplineId: "d5", name: "Prova 1", weight: 5, maxValue: 10, score: 6.5, date: "2026-05-20" },
  { id: "g4", disciplineId: "d3", name: "Prova Prática", weight: 6, maxValue: 10, score: undefined, date: "2026-08-15" },
];

export const libraryItems: LibraryItem[] = [
  { id: "l1", title: "Slides — Anatomia Dentária", type: "SLIDE", disciplineId: "d1", professor: "Dra. Ana Militão", subject: "Anatomia", date: "2026-03-12" },
  { id: "l2", title: "PDF — Protocolo de Biossegurança", type: "PDF", disciplineId: "d2", professor: "Dr. Rafael Souza", subject: "Biossegurança", date: "2026-04-02" },
  { id: "l3", title: "Vídeo — Técnica de Isolamento Absoluto", type: "VIDEO", disciplineId: "d3", professor: "Dra. Camila Prado", subject: "Endodontia", date: "2026-04-18" },
];

export const photos: PhotoItem[] = [
  { id: "p1", url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600", description: "Caso de restauração classe II", phase: "depois", disciplineId: "d1", date: "2026-07-20" },
  { id: "p2", url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600", description: "Radiografia inicial", phase: "antes", disciplineId: "d3", date: "2026-07-22" },
];

export const patients: Patient[] = [
  { id: "pt1", name: "Marcos Vinícius", age: 34, professor: "Dra. Ana Militão", procedures: ["Restauração Classe II", "Profilaxia"], nextReturn: "2026-08-20" },
  { id: "pt2", name: "Luísa Andrade", age: 27, professor: "Dr. Rafael Souza", procedures: ["Exodontia"], nextReturn: undefined },
];

export const weeklyGoals: WeeklyGoal[] = [
  { id: "w1", label: "Horas estudadas", current: 7, target: 12, unit: "h" },
  { id: "w2", label: "Resumos concluídos", current: 3, target: 5 },
  { id: "w3", label: "Revisar Endodontia", current: 0, target: 1 },
];

export const studyHoursSeries = [
  { day: "Seg", horas: 1.5 }, { day: "Ter", horas: 2 }, { day: "Qua", horas: 1 },
  { day: "Qui", horas: 2.5 }, { day: "Sex", horas: 0 }, { day: "Sáb", horas: 3 }, { day: "Dom", horas: 1 },
];

export const gradesSeries = disciplines.map((d) => ({
  disciplina: d.name.split(" ")[0],
  media: Math.round((6 + Math.random() * 3) * 10) / 10,
}));

export const streak = { current: 6, longest: 14, goal: 7 };
