
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.js";
import * as taskService from "../services/taskService.js";

export async function listProjectTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = {
      ...req.query,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    };

    const result = await taskService.listProjectTasks(
      req.params.id as string,
      req.userId!,
      query as never,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}


export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.createTask(
      req.params.id as string,
      req.userId!,
      req.body,
    );
    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function getTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.getTask(req.params.id as string, req.userId!);
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.updateTask(
      req.params.id as string,
      req.userId!,
      req.body,
    );
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function changeTaskStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.changeTaskStatus(
      req.params.id as string,
      req.userId!,
      req.body.status,
    );
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    await taskService.deleteTask(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listMyTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = {
      ...req.query,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    };

    const result = await taskService.listMyTasks(
      req.userId!,
      query as never,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
