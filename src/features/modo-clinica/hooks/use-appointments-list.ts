"use client";

import { useQuery } from "@tanstack/react-query";
import { appointmentsRepository } from "@/repositories/appointments.repository";

export function useAppointmentsList() {
  const query = useQuery({ queryKey: ["appointments"], queryFn: appointmentsRepository.list });
  return { appointments: query.data ?? [], isLoading: query.isLoading };
}
