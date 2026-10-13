
import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  projectId: z.string().trim().min(1, "Project ID is required").optional(),
});

export const createTaskSchema = taskSchema.omit({ projectId: true });

export const updateTaskSchema = createTaskSchema.partial();

export const taskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  assigneeId: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  q: z.string().trim().optional(),
  project: z.string().trim().optional(),
  sort: z.enum(["dueDate", "createdAt", "updatedAt", "title", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
