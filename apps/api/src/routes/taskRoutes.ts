
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskStatusSchema,
  taskListQuerySchema,
} from "@trackly/shared";
import {
  getTask,
  updateTask,
  changeTaskStatus,
  deleteTask,
  listMyTasks,
} from "../controllers/taskController.js";

const router = Router();

router.use(requireAuth);

// Keep /me before /:id so it is not treated as a task ID.
router.get("/me", validate({ query: taskListQuerySchema }), listMyTasks);

router.get("/:id", getTask);
router.patch("/:id", validate({ body: updateTaskSchema }), updateTask);
router.patch("/:id/status", validate({ body: taskStatusSchema }), changeTaskStatus);
router.delete("/:id", deleteTask);

export default router;
