import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional(),
  memberEmails: z
    .array(z.string().trim().email("Invalid email"))
    .optional(),
});

export const projectListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  sort: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectListQueryInput = z.infer<typeof projectListQuerySchema>;