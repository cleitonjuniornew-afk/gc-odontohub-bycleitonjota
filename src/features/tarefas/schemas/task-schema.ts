import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Dê um título para a tarefa"),
  description: z.string().optional(),
  priority: z.enum(["BAIXA", "MEDIA", "ALTA"]),
  dueDate: z.string().optional(),
  disciplineId: z.string().optional(),
});
export type TaskFormInput = z.infer<typeof taskSchema>;
