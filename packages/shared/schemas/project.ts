import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
