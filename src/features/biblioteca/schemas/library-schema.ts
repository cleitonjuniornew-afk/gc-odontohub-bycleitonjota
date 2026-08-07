import { z } from "zod";

export const libraryItemSchema = z.object({
  title: z.string().min(2, "Dê um título ao material"),
  type: z.enum(["PDF", "SLIDE", "VIDEO", "DOCUMENTO"]),
  disciplineId: z.string().optional(),
  professor: z.string().optional(),
  subject: z.string().optional(),
});
export type LibraryItemFormInput = z.infer<typeof libraryItemSchema>;
