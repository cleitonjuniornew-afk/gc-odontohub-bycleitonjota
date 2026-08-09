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

  // ============================================================
  // CRIAR EXAME
  // ============================================================

  const createExamMutation = useMutation({
    mutationFn: (input: {
      patientId: string;
      date?: string;
      observations?: string;
      diagnosis?: string;
      status?: PeriodontalExamStatus;
    }) => periodontiaRepository.createExam(input),

    onSuccess: () => {
      invalidate();
      toast.success("Exame periodontal criado.");
    },

    onError: (error) => {
      console.error(
        "ERRO AO CRIAR EXAME PERIODONTAL:",
        error
      );

      let message =
        "Erro desconhecido ao criar exame periodontal.";

      if (error && typeof error === "object") {
        const err = error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

        message =
          err.message ||
          err.details ||
          err.hint ||
          err.code ||
          JSON.stringify(error);
      } else if (typeof error === "string") {
        message = error;
      }

      toast.error(`Erro: ${message}`);
    },
  });

  // ============================================================
  // ATUALIZAR EXAME
  // ============================================================

  const updateExamMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: {
        date?: string;
        observations?: string | null;
        diagnosis?: string | null;
        status?: PeriodontalExamStatus;
      };
    }) =>
      periodontiaRepository.updateExam(id, input),

    onSuccess: () => {
      invalidate();
      toast.success("Exame atualizado.");
    },

    onError: (error) => {
      console.error(
        "ERRO AO ATUALIZAR EXAME PERIODONTAL:",
        error
      );

      toast.error(
        "Não foi possível atualizar o exame."
      );
    },
  });

  // ============================================================
  // CRIAR / SALVAR DENTE
  // ============================================================

  const createToothMutation = useMutation({
    mutationFn: (input: {
      examId: string;
      toothNumber: number;
      status?: PeriodontalStatus;
      mobility?: number;
      furcationBuccal?: number | null;
      furcationLingual?: number | null;
      suppuration?: boolean;
      plaque?: boolean;
      observations?: string | null;
    }) =>
      periodontiaRepository.createTooth(input),

    onSuccess: () => {
      invalidate();
    },

    onError: (error) => {
      console.error(
        "ERRO AO SALVAR DENTE PERIODONTAL:",
        error
      );

      toast.error(
        "Não foi possível registrar o dente."
      );
    },
  });

  // ============================================================
  // ATUALIZAR DENTE
  // ============================================================

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
    }) =>
      periodontiaRepository.updateTooth(id, input),

    onSuccess: () => {
      invalidate();
    },

    onError: (error) => {
      console.error(
        "ERRO AO ATUALIZAR DENTE PERIODONTAL:",
        error
      );

      toast.error(
        "Não foi possível atualizar o dente."
      );
    },
  });

  // ============================================================
  // SALVAR SÍTIO PERIODONTAL
  // ============================================================

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
    }) =>
      periodontiaRepository.upsertSite(input),

    onSuccess: () => {
      invalidate();
    },

    onError: (error) => {
      console.error(
        "ERRO AO SALVAR MEDIÇÃO PERIODONTAL:",
        error
      );

      toast.error(
        "Não foi possível salvar a medição periodontal."
      );
    },
  });

  // ============================================================
  // EXCLUIR SÍTIO
  // ============================================================

  const deleteSiteMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.deleteSite(id),

    onSuccess: () => {
      invalidate();
    },

    onError: (error) => {
      console.error(
        "ERRO AO REMOVER MEDIÇÃO PERIODONTAL:",
        error
      );

      toast.error(
        "Não foi possível remover a medição."
      );
    },
  });

  // ============================================================
  // INICIALIZAR DENTES
  // ============================================================

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

    onError: (error) => {
      console.error(
        "ERRO AO INICIALIZAR DENTES:",
        error
      );

      toast.error(
        "Não foi possível preparar os dentes do exame."
      );
    },
  });

  // ============================================================
  // FINALIZAR EXAME
  // ============================================================

  const finalizeExamMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.finalizeExam(id),

    onSuccess: () => {
      invalidate();
      toast.success(
        "Exame periodontal finalizado."
      );
    },

    onError: (error) => {
      console.error(
        "ERRO AO FINALIZAR EXAME:",
        error
      );

      toast.error(
        "Não foi possível finalizar o exame."
      );
    },
  });

  // ============================================================
  // EXCLUIR EXAME
  // ============================================================

  const deleteExamMutation = useMutation({
    mutationFn: (id: string) =>
      periodontiaRepository.deleteExam(id),

    onSuccess: () => {
      invalidate();
      toast.success(
        "Exame periodontal removido."
      );
    },

    onError: (error) => {
      console.error(
        "ERRO AO REMOVER EXAME:",
        error
      );

      toast.error(
        "Não foi possível remover o exame."
      );
    },
  });

  // ============================================================
  // RETORNO
  // ============================================================

  return {
    exams: query.data ?? [],

    isLoading: query.isLoading,
    isError: query.isError,

    // Exame
    createExam:
      createExamMutation.mutateAsync,

    isCreatingExam:
      createExamMutation.isPending,

    updateExam:
      updateExamMutation.mutateAsync,

    isUpdatingExam:
      updateExamMutation.isPending,

    // Dente
    createTooth:
      createToothMutation.mutateAsync,

    isCreatingTooth:
      createToothMutation.isPending,

    updateTooth:
      updateToothMutation.mutateAsync,

    isUpdatingTooth:
      updateToothMutation.isPending,

    // Sítio
    saveSite:
      upsertSiteMutation.mutateAsync,

    isSavingSite:
      upsertSiteMutation.isPending,

    deleteSite:
      deleteSiteMutation.mutateAsync,

    isDeletingSite:
      deleteSiteMutation.isPending,

    // Inicialização
    initializeTeeth:
      initializeTeethMutation.mutateAsync,

    isInitializingTeeth:
      initializeTeethMutation.isPending,

    // Finalização
    finalizeExam:
      finalizeExamMutation.mutateAsync,

    isFinalizingExam:
      finalizeExamMutation.isPending,

    // Exclusão
    deleteExam:
      deleteExamMutation.mutateAsync,

    isDeletingExam:
      deleteExamMutation.isPending,

    // Query
    refetch:
      query.refetch,
  };
}

export type { PeriodontalExam };
