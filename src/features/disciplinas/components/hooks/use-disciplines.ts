"use client";

import { useQuery } from "@tanstack/react-query";
import { disciplinesRepository } from "@/repositories/disciplines.repository";

const QUERY_KEY = ["disciplines"];

export function useDisciplines() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: disciplinesRepository.list,
  });

  return {
    disciplines: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
