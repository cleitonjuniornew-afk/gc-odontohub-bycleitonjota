export type Priority = "BAIXA" | "MEDIA" | "ALTA";

export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  priority: Priority;
  dueDate?: string;
  disciplineId?: string;
  learned?: string;
}

export interface Discipline {
  id: string;
  slug: string;
  name: string;
  color: string;
  professor?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  type: "prova" | "clinica" | "aula" | "evento";
  color: string;
  start: string;
  end?: string;
  disciplineId?: string;
}

export interface Grade {
  id: string;
  disciplineId: string;
  name: string;
  weight: number;
  maxValue: number;
  score?: number;
  date?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  type: "PDF" | "SLIDE" | "VIDEO" | "DOCUMENTO";
  disciplineId?: string;
  professor?: string;
  subject?: string;
  date: string;
  url?: string;
  storagePath?: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  description?: string;
  phase?: "antes" | "durante" | "depois";
  disciplineId?: string;
  date: string;
  storagePath?: string;
  patientId?: string;
  appointmentId?: string;
}

export interface PatientProcedure {
  id: string;
  procedure: string;
  status: "EM_ANDAMENTO" | "PLANEJADO" | "CONCLUIDO";
  tooth?: string;
  region?: string;
  details?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  birthDate?: string;
  age?: number;
  professor?: string;
  procedures: PatientProcedure[];
  nextReturn?: string;
  notes?: string;
}

export type AppointmentStatus = "EM_ANDAMENTO" | "FINALIZADO";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
}

export interface TimelineEntry {
  id: string;
  time: string;
  description: string;
}

export interface Appointment {
  id: string;

  patientId?: string;
  procedureId?: string;

  patientName: string;
  patientAge?: number;

  discipline: string;
  professor: string;
  procedure: string;

  status: AppointmentStatus;

  startedAt: string;
  finishedAt?: string;

  checklist: ChecklistItem[];
  materials: MaterialItem[];

  clinicalNotes: string;
  complications?: string;
  professorObservations?: string;
  pendencies?: string;

  returnDate?: string;
  returnNotes?: string;

  timeline: TimelineEntry[];

  resumoComoFoi?: string;
  resumoAprendizado?: string;
  resumoFariaDiferente?: string;
  resumoDificuldade?: string;
}

export interface WeeklyGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
}
