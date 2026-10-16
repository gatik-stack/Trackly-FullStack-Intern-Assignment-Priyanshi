import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional(),
  status: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().trim().min(1).optional(),
  projectId: z.string().trim().min(1, "Project ID is required"),
});

export type TaskInput = z.infer<typeof taskSchema>;
