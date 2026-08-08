import { z } from "zod";

export const patientProcedureSchema = z.object({
  id: z.string(),
  procedure: z.string().min(1, "Selecione o procedimento"),
  tooth: z.string().optional(),
  region: z.string().optional(),
  details: z.string().optional(),
  status: z.enum(["PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO"]).default("PLANEJADO"),
});

export const patientSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  professor: z.string().optional(),

  procedures: z.array(patientProcedureSchema).default([]),

  nextReturn: z.string().optional(),
  notes: z.string().optional(),
});

export type PatientProcedureFormInput = z.infer<
  typeof patientProcedureSchema
>;

export type PatientFormInput = z.infer<typeof patientSchema>;
