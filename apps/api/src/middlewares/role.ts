import { NextFunction, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { AuthenticatedRequest } from "./auth.js";

export function requireRole(role: "ADMIN" | "MEMBER") {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      next(
        new AppError(
          "Authentication required",
          401,
          "UNAUTHORIZED",
        ),
      );
      return;
    }

    if (req.user.role !== role) {
      next(
        new AppError(
          "Forbidden",
          403,
          "FORBIDDEN",
        ),
      );
      return;
    }

    next();
  };
}