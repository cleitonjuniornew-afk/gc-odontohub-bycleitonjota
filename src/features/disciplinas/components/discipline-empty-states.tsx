"use client";

import { ListTodo, FileText, Image as ImageIcon, GraduationCap, StickyNote } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

const notify = () => toast.info("Formulário de criação em construção.");

export function TasksEmptyState() {
  return <EmptyState icon={ListTodo} title="Sem tarefas por aqui" description="Cadastre a primeira tarefa desta disciplina." actionLabel="Adicionar tarefa" onAction={notify} />;
}

export function LibraryEmptyState() {
  return <EmptyState icon={FileText} title="Biblioteca vazia" description="Adicione slides, PDFs ou vídeos desta disciplina." actionLabel="Adicionar material" onAction={notify} />;
}

export function PhotosEmptyState() {
  return <EmptyState icon={ImageIcon} title="Nenhuma foto ainda" description="Registre fotos de casos e procedimentos desta disciplina." actionLabel="Adicionar foto" onAction={notify} />;
}

export function GradesEmptyState() {
  return <EmptyState icon={GraduationCap} title="Notas em breve" description="Cadastre avaliações desta disciplina na aba Notas do menu principal." />;
}

export function ObservationsEmptyState() {
  return <EmptyState icon={StickyNote} title="Sem observações" description="Registre observações importantes sobre esta disciplina." actionLabel="Adicionar observação" onAction={notify} />;
}
