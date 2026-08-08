"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  periodontiaRepository,
  type PeriodontalExam,
  type PeriodontalExamStatus,
  type PeriodontalStatus,
  type PeriodontalSurface,
  type PeriodontalPoint,
} from "@/repositories/periodontia.repository";

const QUERY_KEY = ["periodontia"];

export function usePeriodontia() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: periodontiaRepository.listExams,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEY,
    });
  };

  const createExamMutation = useMutation({
    mutationFn: (input: {
      patientId: string;
      date?: string;
      observations?: string;
      diagnosis?: string;
    }) => periodontiaRepository.createExam(input),

    onSuccess: () => {
      invalidate();
      toast.success("Exame periodontal criado.");
    },

    onError: () => {
      toast.error("Não foi possível criar o exame periodontal.");
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        date?: string;
        observations?: string;
        diagnosis?: string;
        status?: PeriodontalExamStatus;
      };
    }) => periodontiaRepository.updateExam(id, input),

    onSuccess: () => {
      invalidate();
      toast.success("Exame atualizado.");
    },

    onError: () => {
      toast.error("Não foi possível atualizar o exame.");
    },
  });

  const createToothMutation = useMutation({
    mutationFn: (input: {
      examId: string;
      toothNumber: number;
      status?: PeriodontalStatus;
    }) => periodontiaRepository.createTooth(input),

    onSuccess: () => {
      invalidate();
    },

    onError: () => {
      toast.error("Não foi possível registrar o dente.");
    },
  });

  const updateToothMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        status?: PeriodontalStatus;
        mobility?: number;
        furcationBuccal?: number | null;
        furcationLingual?: number | null;
        suppuration?: boolean;
        plaque?: boolean;
        observations?: string | null;
      };
    }) => periodontiaRepository.updateTooth(id, input),

    onSuccess: () => {
      invalidate();
    },

    onError: () => {
      toast.error("Não foi possível atualizar o dente.");
    },
  });

  const upsertSiteMutation = useMutation({
    mutationFn: (input: {
      toothId: string;
      surface: PeriodontalSurface;
      point: PeriodontalPoint;
      probingDepth?: number | null;
      gingivalRecession?: number | null;
      clinicalAttachmentLevel?: number | null;
      bleeding?: boolean;
      plaque?: boolean;
      suppuration?: boolean;
      observations?: string | null;
    }) => periodontiaRepository.upsertSite(input),

    onSuccess: () => {
      invalidate();
    },

    onError: () => {
      toast.error("Não foi possível salvar a medição periodontal.");
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.deleteSite(id),

    onSuccess: () => {
      invalidate();
    },

    onError: () => {
      toast.error("Não foi possível remover a medição.");
    },
  });

  const initializeTeethMutation = useMutation({
    mutationFn: ({
      examId,
      toothNumbers,
    }: {
      examId: string;
      toothNumbers: number[];
    }) =>
      periodontiaRepository.initializeExamTeeth(
        examId,
        toothNumbers
      ),

    onSuccess: () => {
      invalidate();
    },

    onError: () => {
      toast.error("Não foi possível preparar os dentes do exame.");
    },
  });

  const finalizeExamMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.finalizeExam(id),

    onSuccess: () => {
      invalidate();
      toast.success("Exame periodontal finalizado.");
    },

    onError: () => {
      toast.error("Não foi possível finalizar o exame.");
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.deleteExam(id),

    onSuccess: () => {
      invalidate();
      toast.success("Exame periodontal removido.");
    },

    onError: () => {
      toast.error("Não foi possível remover o exame.");
    },
  });

  return {
    exams: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    createExam: createExamMutation.mutateAsync,
    isCreatingExam: createExamMutation.isPending,

    updateExam: updateExamMutation.mutateAsync,
    isUpdatingExam: updateExamMutation.isPending,

    createTooth: createToothMutation.mutateAsync,
    isCreatingTooth: createToothMutation.isPending,

    updateTooth: updateToothMutation.mutateAsync,
    isUpdatingTooth: updateToothMutation.isPending,

    saveSite: upsertSiteMutation.mutateAsync,
    isSavingSite: upsertSiteMutation.isPending,

    deleteSite: deleteSiteMutation.mutateAsync,
    isDeletingSite: deleteSiteMutation.isPending,

    initializeTeeth: initializeTeethMutation.mutateAsync,
    isInitializingTeeth: initializeTeethMutation.isPending,

    finalizeExam: finalizeExamMutation.mutateAsync,
    isFinalizingExam: finalizeExamMutation.isPending,

    deleteExam: deleteExamMutation.mutateAsync,
    isDeletingExam: deleteExamMutation.isPending,

    refetch: query.refetch,
  };
}

export type { PeriodontalExam };
