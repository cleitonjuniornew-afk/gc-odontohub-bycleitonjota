"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { objectivesRepository, type Objective } from "@/repositories/objectives.repository";
import { notifyDeletion } from "@/lib/confirm-delete";

const QUERY_KEY = ["objectives"];

export function useObjectives(type?: Objective["type"]) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: objectivesRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Objective, "id">) => objectivesRepository.create(input),
    onSuccess: () => { invalidate(); toast.success("Objetivo criado."); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Objective> }) => objectivesRepository.update(id, input),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => objectivesRepository.softDelete(id),
    onSuccess: (_d, id) => {
      invalidate();
      notifyDeletion("Objetivo", async () => { await objectivesRepository.restore(id); invalidate(); });
    },
  });

  const all = query.data ?? [];
  return {
    objectives: type ? all.filter((o) => o.type === type) : all,
    isLoading: query.isLoading,
    createObjective: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateObjective: updateMutation.mutate,
    deleteObjective: deleteMutation.mutate,
  };
}
