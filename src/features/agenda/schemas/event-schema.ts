import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(2, "Dê um título para o evento"),
  type: z.enum(["prova", "clinica", "aula", "evento"]),
  date: z.string().min(1, "Selecione a data"),
  time: z.string().optional(),
  disciplineId: z.string().optional(),
});
export type EventFormInput = z.infer<typeof eventSchema>;

export const TYPE_COLOR: Record<EventFormInput["type"], string> = {
  prova: "#EF4444",
  clinica: "#D4AF37",
  aula: "#00BFFF",
  evento: "#22C55E",
};

export const TYPE_LABEL: Record<EventFormInput["type"], string> = {
  prova: "Prova",
  clinica: "Clínica",
  aula: "Aula",
  evento: "Evento",
};
