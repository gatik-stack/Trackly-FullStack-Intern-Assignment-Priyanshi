import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "./activityService.js";

export async function createComment(
  taskId: string,
  authorId: string,
  body: string,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
    },
  });

  if (!task) {
    throw new AppError("Task not found", 404, "TASK_NOT_FOUND");
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: authorId,
        projectId: task.projectId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      "You are not a member of this project",
      403,
      "FORBIDDEN",
    );
  }

  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        body,
        taskId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await logActivity(tx, {
      action: "COMMENT_ADDED",
      projectId: task.projectId,
      taskId,
      userId: authorId,
      meta: { commentId: comment.id },
    });

    return comment;
  });
}

export async function deleteComment(
  commentId: string,
  userId: string,
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }

  if (comment.authorId !== userId) {
    throw new AppError(
      "You can only delete your own comments",
      403,
      "FORBIDDEN",
    );
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted successfully" };
}
