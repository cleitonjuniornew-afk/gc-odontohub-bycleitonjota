"use client";

import {
  FileText,
  Image as ImageIcon,
  GraduationCap,
  StickyNote,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function LibraryEmptyState() {
  return (
    <EmptyState
      icon={FileText}
      title="Biblioteca vazia"
      description="Adicione slides, PDFs ou vídeos desta disciplina."
    />
  );
}

export function PhotosEmptyState() {
  return (
    <EmptyState
      icon={ImageIcon}
      title="Nenhuma foto ainda"
      description="Registre fotos de casos e procedimentos desta disciplina."
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

export function ObservationsEmptyState() {
  return (
    <EmptyState
      icon={StickyNote}
      title="Sem observações"
      description="Registre observações importantes sobre esta disciplina."
    />
  );
}
