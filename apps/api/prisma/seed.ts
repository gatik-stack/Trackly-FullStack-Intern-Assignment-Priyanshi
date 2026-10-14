import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const password = await bcrypt.hash("Trackly@123", 12);

  console.log("Clearing existing demo data...");

  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");

  const admin = await prisma.user.create({
    data: {
      name: "Trackly Admin",
      email: "admin@trackly.com",
      password,
      role: "ADMIN",
    },
  });

  const members = await Promise.all([
    prisma.user.create({
      data: {
        name: "Priyanshi Seth",
        email: "priyanshi@trackly.com",
        password,
        role: "MEMBER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Rahul Sharma",
        email: "rahul@trackly.com",
        password,
        role: "MEMBER",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ananya Singh",
        email: "ananya@trackly.com",
        password,
        role: "MEMBER",
      },
    }),
  ]);

  console.log("Users created.");

  console.log("Creating projects...");

  const projectData = [
    {
      name: "Trackly Web App",
      description: "Development of the Trackly team task management application.",
    },
    {
      name: "Marketing Website",
      description: "Design and development of the company marketing website.",
    },
    {
      name: "Mobile Application",
      description: "Planning and development of the Trackly mobile experience.",
    },
  ];

  const projects = [];

  for (const projectInfo of projectData) {
    const project = await prisma.project.create({
      data: {
        name: projectInfo.name,
        description: projectInfo.description,
        status: "ACTIVE",
      },
    });

    projects.push(project);
  }

  console.log("Projects created.");

  console.log("Creating project memberships...");

  for (const project of projects) {
    await prisma.projectMember.createMany({
      data: [
        {
          userId: admin.id,
          projectId: project.id,
          role: "OWNER",
        },
        {
          userId: members[0].id,
          projectId: project.id,
          role: "MEMBER",
        },
        {
          userId: members[1].id,
          projectId: project.id,
          role: "MEMBER",
        },
        {
          userId: members[2].id,
          projectId: project.id,
          role: "MEMBER",
        },
      ],
    });
  }

  console.log("Project memberships created.");

  console.log("Creating tasks...");

  const taskTemplates = [
    {
      title: "Set up project structure",
      status: "DONE" as const,
      priority: "HIGH" as const,
    },
    {
      title: "Create authentication flow",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
    },
    {
      title: "Build dashboard UI",
      status: "IN_REVIEW" as const,
      priority: "HIGH" as const,
    },
    {
      title: "Implement project management",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
    },
    {
      title: "Add task creation form",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
    },
    {
      title: "Implement Kanban board",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
    },
    {
      title: "Add task filtering",
      status: "TODO" as const,
      priority: "LOW" as const,
    },
    {
      title: "Create activity tracking",
      status: "IN_REVIEW" as const,
      priority: "MEDIUM" as const,
    },
    {
      title: "Implement comments",
      status: "TODO" as const,
      priority: "LOW" as const,
    },
    {
      title: "Improve responsive layout",
      status: "IN_PROGRESS" as const,
      priority: "MEDIUM" as const,
    },
  ];

  const allTasks = [];

  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    const project = projects[projectIndex];

    for (let taskIndex = 0; taskIndex < taskTemplates.length; taskIndex++) {
      const template = taskTemplates[taskIndex];
      const assignee = members[(projectIndex + taskIndex) % members.length];

      const task = await prisma.task.create({
        data: {
          title: `${template.title} - ${project.name}`,
          description: `Work item for the ${project.name} project.`,
          status: template.status,
          priority: template.priority,
          position: taskIndex,
          projectId: project.id,
          assigneeId: assignee.id,
          creatorId: admin.id,
        },
      });

      allTasks.push(task);
    }
  }

  console.log(`${allTasks.length} tasks created.`);

  console.log("Creating comments...");

  for (let index = 0; index < 9; index++) {
    const task = allTasks[index];

    await prisma.comment.create({
      data: {
        body: `This task is being tracked as part of the ${task.title} work.`,
        taskId: task.id,
        authorId: members[index % members.length].id,
      },
    });
  }

  console.log("Comments created.");

  console.log("Creating activity records...");

  for (let index = 0; index < 15; index++) {
    const task = allTasks[index % allTasks.length];
    const project = projects[index % projects.length];
    const user = members[index % members.length];

    await prisma.activity.create({
      data: {
        action: index % 2 === 0 ? "TASK_CREATED" : "TASK_UPDATED",
        meta: {
          taskTitle: task.title,
        },
        projectId: project.id,
        taskId: task.id,
        userId: user.id,
      },
    });
  }

  console.log("Activity records created.");

  console.log("");
  console.log("Seed completed successfully.");
  console.log("");
  console.log("Demo credentials:");
  console.log("Admin: admin@trackly.com / Trackly@123");
  console.log("Member: priyanshi@trackly.com / Trackly@123");
  console.log("Member: rahul@trackly.com / Trackly@123");
  console.log("Member: ananya@trackly.com / Trackly@123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
