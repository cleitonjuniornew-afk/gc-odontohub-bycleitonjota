"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { photosRepository } from "@/repositories/photos.repository";
import { notifyDeletion } from "@/lib/confirm-delete";

const QUERY_KEY = ["photos"];

export function usePhotos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: photosRepository.list,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEY,
    });
  };

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      meta,
    }: {
      file: File;
      meta: Parameters<typeof photosRepository.upload>[1];
    }) => {
      return photosRepository.upload(file, meta);
    },

    onSuccess: async () => {
      await invalidate();
      toast.success("Foto adicionada.");
    },

    onError: (error) => {
      console.error("Erro ao enviar foto:", error);

      toast.error(
        "Não foi possível enviar a foto. Verifique o arquivo e tente novamente."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      id,
      storagePath,
    }: {
      id: string;
      storagePath?: string;
    }) => {
      return photosRepository.softDelete(id, storagePath);
    },

    onSuccess: async (_data, { id }) => {
      await invalidate();

      notifyDeletion("Foto", async () => {
        await photosRepository.restore(id);
        await invalidate();
      });
    },

    onError: (error) => {
      console.error("Erro ao excluir foto:", error);

      toast.error("Não foi possível excluir a foto.");
    },
  });

  return {
    photos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    uploadPhoto: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,

    deletePhoto: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
