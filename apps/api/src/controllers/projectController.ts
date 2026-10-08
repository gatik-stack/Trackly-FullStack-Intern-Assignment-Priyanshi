import { Request, Response } from "express";
import { ProjectInput } from "@trackly/shared";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../services/projectService.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

export async function list(
  req: AuthenticatedRequest,
  res: Response,
) {
  const userId = req.user!.id;

  const result = await listProjects(userId, {
    q: req.query.q as string | undefined,
    status:
      req.query.status === "ACTIVE" || req.query.status === "ARCHIVED"
        ? req.query.status
        : undefined,
    sort:
      req.query.sort === "updatedAt" ||
      req.query.sort === "name" ||
      req.query.sort === "createdAt"
        ? req.query.sort
        : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  res.json(result);
}
export async function create(
  req: AuthenticatedRequest,
  res: Response,
) {
  const userId = req.user!.id;

  const input = req.body as ProjectInput;

  const result = await createProject(userId, input);

  res.status(201).json(result);
}

export async function get(
  req: AuthenticatedRequest,
  res: Response,
) {
  const userId = req.user!.id;
  const projectId = req.params.id as string;

  const project = await getProject(userId, projectId);

  res.json(project);
}

export async function update(
  req: AuthenticatedRequest,
  res: Response,
) {
  const projectId = req.params.id as string;

  const input = req.body as Pick<ProjectInput, "name" | "description">;

  const project = await updateProject(projectId, input);

  res.json(project);
}

export async function remove(
  req: Request,
  res: Response,
) {
  const projectId = req.params.id as string;

  await deleteProject(projectId);

  res.status(204).send();
}