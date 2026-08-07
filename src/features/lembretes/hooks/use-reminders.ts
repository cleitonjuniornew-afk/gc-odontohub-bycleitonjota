"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { remindersRepository, type Reminder } from "@/repositories/reminders.repository";
import { notifyDeletion } from "@/lib/confirm-delete";

const QUERY_KEY = ["reminders"];

export function useReminders() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: remindersRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Reminder, "id">) => remindersRepository.create(input),
    onSuccess: () => { invalidate(); toast.success("Lembrete criado."); },
    onError: () => toast.error("Não foi possível criar o lembrete."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Reminder> }) => remindersRepository.update(id, input),
    onSuccess: () => { invalidate(); toast.success("Lembrete atualizado."); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remindersRepository.softDelete(id),
    onSuccess: (_d, id) => {
      invalidate();
      notifyDeletion("Lembrete", async () => { await remindersRepository.restore(id); invalidate(); });
    },
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
    createReminder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReminder: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReminder: deleteMutation.mutate,
  };
}
