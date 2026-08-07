import { z } from "zod";

export const reminderSchema = z.object({
  title: z.string().min(2, "Dê um título para o lembrete"),
  category: z.string().optional(),
  recurring: z.boolean(),
  date: z.string().optional(),
});
export type ReminderFormInput = z.infer<typeof reminderSchema>;
