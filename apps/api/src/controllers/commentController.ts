import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import {
  createComment,
  deleteComment,
} from "../services/commentService.js";

export async function addComment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { body } = req.body;
    const comment = await createComment(
      req.params.id as string,
      req.userId!,
      body,
    );

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

export async function removeComment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteComment(
      req.params.id as string,
      req.userId!,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
