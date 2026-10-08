import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
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

    req.userId = payload.userId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
  }
}