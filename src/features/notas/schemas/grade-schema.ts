import { z } from "zod";

export const gradeSchema = z.object({
  disciplineId: z.string().min(1, "Selecione a disciplina"),
  name: z.string().min(1, "Dê um nome para a avaliação"),
  weight: z.coerce.number().min(0.1, "Peso deve ser maior que zero"),
  maxValue: z.coerce.number().min(1, "Valor máximo deve ser maior que zero"),
  score: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  date: z.string().optional(),
});
export type GradeFormInput = z.infer<typeof gradeSchema>;
