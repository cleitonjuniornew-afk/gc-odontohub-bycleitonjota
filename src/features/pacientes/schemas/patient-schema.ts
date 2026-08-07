import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Informe o nome do paciente"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  professor: z.string().optional(),
  procedures: z.string().optional(), // separado por vírgula no formulário
  nextReturn: z.string().optional(),
  notes: z.string().optional(),
});
export type PatientFormInput = z.infer<typeof patientSchema>;
