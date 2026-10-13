import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "./activityService.js";

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
};

async function ensureProjectMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!membership) {
    throw new AppError(
      "You are not a member of this project",
      403,
      "FORBIDDEN",
    );
  }
}

async function getTaskForMember(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { select: { id: true } } },
  });

  if (!task) {
    throw new AppError("Task not found", 404, "NOT_FOUND");
  }

  await ensureProjectMember(task.projectId, userId);
  return task;
}

function validateDueDate(dueDate?: Date | string | null): Date | null | undefined {
  if (dueDate == null) return dueDate;

  const parsedDate =
    dueDate instanceof Date ? dueDate : new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Invalid due date", 400, "VALIDATION_ERROR");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    throw new AppError(
      "Due date cannot be in the past",
      400,
      "VALIDATION_ERROR",
    );
  }

  return parsedDate;
}

async function validateAssignee(
  projectId: string,
  assigneeId?: string | null,
) {
  if (!assigneeId) return;

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: assigneeId, projectId } },
  });

  if (!membership) {
    throw new AppError(
      "Assignee must be a member of the project",
      400,
      "INVALID_ASSIGNEE",
    );
  }
}

export async function listProjectTasks(
  projectId: string,
  userId: string,
  query: {
    page: number;
    limit: number;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    assigneeId?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    q?: string;
    sort?: "dueDate" | "createdAt" | "updatedAt" | "title" | "priority";
    sortOrder?: "asc" | "desc";
  },
) {
  await ensureProjectMember(projectId, userId);

  const where: Prisma.TaskWhereInput = {
    projectId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const page = query.page || 1;
  const limit = query.limit || 20;

  const orderBy = {
    [query.sort || "createdAt"]: query.sortOrder || "desc",
  } as Prisma.TaskOrderByWithRelationInput;

  const [total, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { data: tasks, meta: { page, limit, total } };
}

export async function createTask(
  projectId: string,
  userId: string,
  input: {
    title: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: Date | string;
    assigneeId?: string | null;
  },
) {
  await ensureProjectMember(projectId, userId);

  const dueDate = validateDueDate(input.dueDate);
  await validateAssignee(projectId, input.assigneeId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate,
        assigneeId: input.assigneeId,
        projectId,
        creatorId: userId,
      },
      include: taskInclude,
    });

    await logActivity(tx, {
      action: "TASK_CREATED",
      projectId,
      taskId: task.id,
      userId,
      meta: { title: task.title },
    });

    return task;
  });
}

export async function getTask(taskId: string, userId: string) {
  const task = await getTaskForMember(taskId, userId);

  const fullTask = await prisma.task.findUniqueOrThrow({
    where: { id: task.id },
    include: {
      ...taskInclude,
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const activity = await prisma.activity.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { ...fullTask, activity };
}

export async function updateTask(
  taskId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: Date | string | null;
    assigneeId?: string | null;
  },
) {
  const existing = await getTaskForMember(taskId, userId);

  let dueDate: Date | null | undefined;

  if (input.dueDate !== undefined) {
    dueDate = validateDueDate(input.dueDate);
  }

  if (input.assigneeId !== undefined) {
    await validateAssignee(existing.projectId, input.assigneeId);
  }

  const changes: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) changes.title = input.title;
  if (input.description !== undefined) changes.description = input.description;
  if (input.status !== undefined) changes.status = input.status;
  if (input.priority !== undefined) changes.priority = input.priority;

  if (input.dueDate !== undefined) {
    changes.dueDate = dueDate;
  }

  if (input.assigneeId !== undefined) {
    changes.assignee = input.assigneeId
      ? { connect: { id: input.assigneeId } }
      : { disconnect: true };
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError(
      "At least one field must be provided",
      400,
      "VALIDATION_ERROR",
    );
  }

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: { id: taskId },
      data: changes,
      include: taskInclude,
    });

    await logActivity(tx, {
      action: "TASK_UPDATED",
      projectId: task.projectId,
      taskId,
      userId,
      meta: { fields: Object.keys(changes) },
    });

    return task;
  });
}

export async function changeTaskStatus(
  taskId: string,
  userId: string,
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
) {
  const existing = await getTaskForMember(taskId, userId);

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: { id: taskId },
      data: { status },
      include: taskInclude,
    });

    await logActivity(tx, {
      action: "TASK_STATUS_CHANGED",
      projectId: task.projectId,
      taskId,
      userId,
      meta: { from: existing.status, to: status },
    });

    return task;
  });
}

export async function deleteTask(taskId: string, userId: string) {
  const existing = await getTaskForMember(taskId, userId);

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: taskId } });

    await logActivity(tx, {
      action: "TASK_DELETED",
      projectId: existing.projectId,
      taskId,
      userId,
      meta: { title: existing.title },
    });
  });
}

export async function listMyTasks(
  userId: string,
  query: {
    page: number;
    limit: number;
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    project?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    q?: string;
    sort?: "dueDate" | "createdAt" | "updatedAt" | "title" | "priority";
    sortOrder?: "asc" | "desc";
  },
) {
  const where: Prisma.TaskWhereInput = {
    assigneeId: userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.project ? { projectId: query.project } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const page = query.page || 1;
  const limit = query.limit || 20;

  const orderBy = {
    [query.sort || "createdAt"]: query.sortOrder || "desc",
  } as Prisma.TaskOrderByWithRelationInput;

  const [total, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: {
        ...taskInclude,
        project: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { data: tasks, meta: { page, limit, total } };
}
