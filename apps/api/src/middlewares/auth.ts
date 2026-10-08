import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../services/authService.js";

type AuthenticatedUser = Awaited<ReturnType<typeof getUserById>>;

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: AuthenticatedUser;
  projectMembership?: {
    userId: string;
    projectId: string;
    role: "OWNER" | "MEMBER";
    joinedAt: Date;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.trackly_token;

    if (!token) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const payload = verifyToken(token);

    const user = await getUserById(payload.userId);

    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }
}