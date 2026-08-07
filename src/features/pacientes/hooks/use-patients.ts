"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patientsRepository } from "@/repositories/patients.repository";
import { notifyDeletion } from "@/lib/confirm-delete";
import type { Patient } from "@/types";

const QUERY_KEY = ["patients"];

export function usePatients() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: patientsRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Patient, "id">) => patientsRepository.create(input),
    onSuccess: () => { invalidate(); toast.success("Paciente cadastrado com sucesso."); },
    onError: () => toast.error("Não foi possível cadastrar o paciente. Vamos tentar novamente."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Patient> }) => patientsRepository.update(id, input),
    onSuccess: () => { invalidate(); toast.success("Paciente atualizado."); },
    onError: () => toast.error("Não foi possível salvar as alterações."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsRepository.softDelete(id),
    onSuccess: (_d, id) => {
      invalidate();
      notifyDeletion("Paciente", async () => { await patientsRepository.restore(id); invalidate(); });
    },
    onError: () => toast.error("Não foi possível remover o paciente."),
  });

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    createPatient: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePatient: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePatient: deleteMutation.mutate,
  };
}
