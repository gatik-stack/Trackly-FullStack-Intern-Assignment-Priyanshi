import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
}