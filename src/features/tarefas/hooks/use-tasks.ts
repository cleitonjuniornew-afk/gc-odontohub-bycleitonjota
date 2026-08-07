"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tasksRepository } from "@/repositories/tasks.repository";
import { notifyDeletion } from "@/lib/confirm-delete";
import type { Task } from "@/types";

const QUERY_KEY = ["tasks"];

export function useTasks() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: tasksRepository.list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Task, "id">) => tasksRepository.create(input),
    onSuccess: () => {
      invalidate();
      toast.success("Tarefa criada com sucesso.");
    },
    onError: () => toast.error("Não foi possível criar a tarefa. Vamos tentar novamente."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Task> }) => tasksRepository.update(id, input),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Não foi possível salvar as alterações."),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, learned }: { id: string; learned?: string }) =>
      tasksRepository.update(id, { done: true, learned }),
    onSuccess: () => {
      invalidate();
      toast.success("Excelente! Continue assim.");
    },
    onError: () => toast.error("Não foi possível concluir a tarefa."),
  });

  const reopenMutation = useMutation({
    mutationFn: (id: string) => tasksRepository.update(id, { done: false }),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksRepository.softDelete(id),
    onSuccess: (_data, id) => {
      invalidate();
      notifyDeletion("Tarefa", async () => {
        await tasksRepository.restore(id);
        invalidate();
      });
    },
    onError: () => toast.error("Não foi possível remover a tarefa."),
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTask: updateMutation.mutateAsync,
    completeTask: completeMutation.mutateAsync,
    reopenTask: reopenMutation.mutate,
    deleteTask: deleteMutation.mutate,
  };
}
