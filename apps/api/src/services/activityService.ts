
import type { Prisma } from "../../generated/prisma/client.js";

type LogActivityInput = {
  action: string;
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
      ...(input.meta ? { meta: input.meta } : {}),
    },
  });
}
