
import { Request, Response } from "express";
import { addProjectMember, removeProjectMember } from "../services/memberService.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

export async function add(
  req: AuthenticatedRequest,
  res: Response,
) {
  const projectId = req.params.id as string;
  const { email, role } = req.body as {
    email: string;
    role?: "OWNER" | "MEMBER";
  };

  const actorId = req.user!.id;

const member = await addProjectMember(
  projectId,
  email,
  actorId,
  role ?? "MEMBER",
);
  res.status(201).json(member);
}

export async function remove(
  req: AuthenticatedRequest,
  res: Response,
) {
  const projectId = req.params.id as string;
  const userId = req.params.userId as string;
  const ownerId = req.user!.id;

  const result = await removeProjectMember(
    projectId,
    userId,
    ownerId,
  );

  res.json(result);
}
 
