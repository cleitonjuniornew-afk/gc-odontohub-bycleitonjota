import { z } from "zod";

export const procedureSchema = z.object({
  id: z.string(),
  procedure: z.string().min(1, "Informe o procedimento"),
  status: z.enum([
    "PLANEJADO",
    "EM_ANDAMENTO",
    "CONCLUIDO",
  ]),
  tooth: z.string().optional(),
  region: z.string().optional(),
  details: z.string().optional(),
});

export const patientSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente"),

  phone: z.string().optional(),

  birthDate: z.string().optional(),

  professor: z.string().optional(),

  procedures: z.array(procedureSchema).default([]),

  nextReturn: z.string().optional(),

  notes: z.string().optional(),
});

export type ProcedureFormInput = z.infer<typeof procedureSchema>;

export type PatientFormInput = z.infer<typeof patientSchema>;
