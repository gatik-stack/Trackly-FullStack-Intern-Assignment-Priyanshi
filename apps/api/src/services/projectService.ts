import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { ProjectInput } from "@trackly/shared";

export async function listProjects(
  userId: string,
  options: {
    q?: string;
    status?: "ACTIVE" | "ARCHIVED";
    sort?: "createdAt" | "updatedAt" | "name";
    page?: number;
    limit?: number;
  },
) {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(options.q
      ? {
          name: {
            contains: options.q,
          },
        }
      : {}),
    ...(options.status
      ? {
          status: options.status,
        }
      : {}),
    members: {
      some: {
        userId,
      },
    },
  };

  const orderBy = {
    [options.sort ?? "createdAt"]: "desc" as const,
  };

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          where: {
            status: "DONE",
          },
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      taskCount: project._count.tasks,
      doneTaskCount: project.tasks.length,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createProject(
  userId: string,
  input: ProjectInput,
) {
  const { memberEmails, ...projectData } = input;

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: projectData,
    });

    await tx.projectMember.create({
      data: {
        userId,
        projectId: project.id,
        role: "OWNER",
      },
    });

    const skippedEmails: string[] = [];

    if (memberEmails?.length) {
      for (const email of memberEmails) {
        const user = await tx.user.findUnique({
          where: { email },
        });

        if (!user) {
          skippedEmails.push(email);
          continue;
        }

        if (user.id === userId) {
          continue;
        }

        await tx.projectMember.create({
          data: {
            userId: user.id,
            projectId: project.id,
            role: "MEMBER",
          },
        });
      }
    }

    return {
      project,
      skippedEmails,
    };
  });
}

export async function getProject(
  userId: string,
  projectId: string,
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        where: {
          status: "DONE",
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(
      "Project not found",
      404,
      "PROJECT_NOT_FOUND",
    );
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    members: project.members,
    taskCount: project._count.tasks,
    doneTaskCount: project.tasks.length,
  };
}

export async function updateProject(
  projectId: string,
  input: Pick<ProjectInput, "name" | "description">,
) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: input,
  });
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
}