
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "./activityService.js";

export async function addProjectMember(
  projectId: string,
  email: string,
  actorId: string,
  role: "OWNER" | "MEMBER" = "MEMBER",
) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (existingMembership) {
    throw new AppError(
      "User is already a project member",
      409,
      "ALREADY_PROJECT_MEMBER",
    );
  }

  return prisma.$transaction(async (tx) => {
    const membership = await tx.projectMember.create({
      data: {
        userId: user.id,
        projectId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await logActivity(tx, {
      action: "MEMBER_ADDED",
      projectId,
      userId: actorId,
      meta: { memberId: user.id, email: user.email },
    });

    return membership;
  });
}

export async function removeProjectMember(
  projectId: string,
  userId: string,
  ownerId: string,
) {
  if (userId === ownerId) {
    throw new AppError(
      "Project owner cannot remove themselves",
      400,
      "CANNOT_REMOVE_SELF",
    );
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!membership) {
    throw new AppError(
      "Project member not found",
      404,
      "PROJECT_MEMBER_NOT_FOUND",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: {
        projectId,
        assigneeId: userId,
      },
      data: { assigneeId: null },
    });

    await tx.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    await logActivity(tx, {
      action: "MEMBER_REMOVED",
      projectId,
      userId: ownerId,
      meta: { memberId: userId },
    });
  });

  return { message: "Project member removed successfully" };
}
