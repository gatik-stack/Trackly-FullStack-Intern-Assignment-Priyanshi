import type { Prisma } from "../../generated/prisma/client.js";

export type ActivityAction =
  | "PROJECT_CREATED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "TASK_DELETED";

type LogActivityInput = {
  action: ActivityAction;
  projectId: string;
  userId: string;
  taskId?: string;
  meta?: Prisma.InputJsonValue;
};

export async function logActivity(
  tx: Prisma.TransactionClient,
  input: LogActivityInput,
) {
  return tx.activity.create({
    data: {
      action: input.action,
      projectId: input.projectId,
      userId: input.userId,
      ...(input.taskId ? { taskId: input.taskId } : {}),
      ...(input.meta !== undefined ? { meta: input.meta } : {}),
    },
  });
}
