import { NextFunction, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { AuthenticatedRequest } from "./auth.js";

export async function requireProjectMember(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const projectId = req.params.id as string;

    if (!projectId) {
      throw new AppError(
        "Project ID is required",
        400,
        "PROJECT_ID_REQUIRED",
      );
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
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

    req.projectMembership = membership;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(error);
  }
}

export function requireProjectOwner(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.projectMembership) {
    next(
      new AppError(
        "Project membership required",
        403,
        "FORBIDDEN",
      ),
    );
    return;
  }

  if (req.projectMembership.role !== "OWNER") {
    next(
      new AppError(
        "Project owner access required",
        403,
        "FORBIDDEN",
      ),
    );
    return;
  }

  next();
}
export async function requireProjectOwnerOrAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    // Admins can delete any project without being a member.
    if (req.user.role === "ADMIN") {
      next();
      return;
    }

    const projectId = req.params.id as string;

    if (!projectId) {
      throw new AppError(
        "Project ID is required",
        400,
        "PROJECT_ID_REQUIRED",
      );
    }

    // Load membership for non-admin users.
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      throw new AppError(
        "Project owner or admin access required",
        403,
        "FORBIDDEN",
      );
    }

    req.projectMembership = membership;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(error);
  }
}