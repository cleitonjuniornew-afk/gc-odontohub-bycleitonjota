"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { libraryRepository } from "@/repositories/library.repository";
import { notifyDeletion } from "@/lib/confirm-delete";
import type { LibraryItem } from "@/types";

const QUERY_KEY = ["library"];

export function useLibrary() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: libraryRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: ({ input, file }: { input: Omit<LibraryItem, "id" | "date">; file?: File }) => libraryRepository.create(input, file),
    onSuccess: () => { invalidate(); toast.success("Material adicionado à biblioteca."); },
    onError: () => toast.error("Não foi possível enviar o material. Vamos tentar novamente."),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath?: string }) => libraryRepository.softDelete(id, storagePath),
    onSuccess: (_d, { id }) => {
      invalidate();
      notifyDeletion("Material", async () => { await libraryRepository.restore(id); invalidate(); });
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    createItem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteItem: deleteMutation.mutate,
  };
}
