"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eventsRepository } from "@/repositories/events.repository";
import { notifyDeletion } from "@/lib/confirm-delete";
import type { AgendaEvent } from "@/types";

const QUERY_KEY = ["events"];

export function useEvents() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: eventsRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<AgendaEvent, "id">) => eventsRepository.create(input),
    onSuccess: () => { invalidate(); toast.success("Evento criado."); },
    onError: () => toast.error("Não foi possível criar o evento."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AgendaEvent> }) => eventsRepository.update(id, input),
    onSuccess: () => { invalidate(); toast.success("Evento atualizado."); },
    onError: () => toast.error("Não foi possível salvar as alterações."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsRepository.softDelete(id),
    onSuccess: (_d, id) => {
      invalidate();
      notifyDeletion("Evento", async () => { await eventsRepository.restore(id); invalidate(); });
    },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    createEvent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEvent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEvent: deleteMutation.mutate,
  };
}
