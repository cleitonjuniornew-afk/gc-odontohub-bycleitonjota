"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { photosRepository } from "@/repositories/photos.repository";
import { notifyDeletion } from "@/lib/confirm-delete";


const QUERY_KEY = ["photos"];

export function usePhotos() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: photosRepository.list });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const uploadMutation = useMutation({
    mutationFn: ({ file, meta }: { file: File; meta: Parameters<typeof photosRepository.upload>[1] }) =>
      photosRepository.upload(file, meta),
    onSuccess: () => { invalidate(); toast.success("Foto adicionada."); },
    onError: () => toast.error("Não foi possível enviar a foto. Vamos tentar novamente."),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath?: string }) => photosRepository.softDelete(id, storagePath),
    onSuccess: (_d, { id }) => {
      invalidate();
      notifyDeletion("Foto", async () => { await photosRepository.restore(id); invalidate(); });
    },
  });

  return {
    photos: query.data ?? [],
    isLoading: query.isLoading,
    uploadPhoto: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deletePhoto: deleteMutation.mutate,
  };
}
