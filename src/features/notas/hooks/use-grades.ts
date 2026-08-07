"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { gradesRepository } from "@/repositories/grades.repository";
import { notifyDeletion } from "@/lib/confirm-delete";
import type { Grade } from "@/types";

const QUERY_KEY = ["grades"];

export function useGrades() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: gradesRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Grade, "id">) => gradesRepository.create(input),
    onSuccess: () => { invalidate(); toast.success("Avaliação adicionada."); },
    onError: () => toast.error("Não foi possível salvar a avaliação."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Grade> }) => gradesRepository.update(id, input),
    onSuccess: () => { invalidate(); toast.success("Avaliação atualizada."); },
    onError: () => toast.error("Não foi possível salvar as alterações."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradesRepository.softDelete(id),
    onSuccess: (_d, id) => {
      invalidate();
      notifyDeletion("Avaliação", async () => { await gradesRepository.restore(id); invalidate(); });
    },
  });

  return {
    grades: query.data ?? [],
    isLoading: query.isLoading,
    createGrade: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateGrade: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteGrade: deleteMutation.mutate,
  };
}
