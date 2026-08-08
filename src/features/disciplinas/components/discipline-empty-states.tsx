"use client";

import {
  FileText,
  Image as ImageIcon,
  GraduationCap,
  StickyNote,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

interface ActionProps {
  onAction: () => void;
}

export function LibraryEmptyState({
  onAction,
}: ActionProps) {
  return (
    <EmptyState
      icon={FileText}
      title="Biblioteca vazia"
      description="Adicione slides, PDFs ou vídeos desta disciplina."
      actionLabel="Adicionar material"
      onAction={onAction}
    />
  );
}

export function PhotosEmptyState({
  onAction,
}: ActionProps) {
  return (
    <EmptyState
      icon={ImageIcon}
      title="Nenhuma foto ainda"
      description="Registre fotos de casos e procedimentos desta disciplina."
      actionLabel="Adicionar foto"
      onAction={onAction}
    />
  );
}

export function GradesEmptyState() {
  return (
    <EmptyState
      icon={GraduationCap}
      title="Notas em breve"
      description="Cadastre avaliações desta disciplina na aba Notas do menu principal."
    />
  );
}

export function ObservationsEmptyState({
  onAction,
}: ActionProps) {
  return (
    <EmptyState
      icon={StickyNote}
      title="Sem observações"
      description="Registre observações importantes sobre esta disciplina."
      actionLabel="Adicionar observação"
      onAction={onAction}
    />
  );
}
