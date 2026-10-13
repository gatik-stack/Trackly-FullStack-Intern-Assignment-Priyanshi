import { Router } from "express";
import {
  create,
  get,
  list,
  remove,
  update,
} from "../controllers/projectController.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  requireProjectMember,
  requireProjectOwner,
  requireProjectOwnerOrAdmin,
} from "../middlewares/project.js";
import { validate } from "../middlewares/validate.js";
import {
  projectListQuerySchema,
  projectSchema,
  createTaskSchema,
  taskListQuerySchema,
} from "@trackly/shared";

import {
  add as addMember,
  remove as removeMember,
} from "../controllers/memberController.js";
const router = Router();

import {
  listProjectTasks,
  createTask,
} from "../controllers/taskController.js";


router.use(requireAuth);

router.get(
  "/",
  validate({ query: projectListQuerySchema }),
  list,
);

router.post(
  "/",
  validate({ body: projectSchema }),
  create,
);

router.get(
  "/:id/tasks",
  requireProjectMember,
  validate({ query: taskListQuerySchema }),
  listProjectTasks,
);

router.post(
  "/:id/tasks",
  requireProjectMember,
  validate({ body: createTaskSchema }),
  createTask,
);
router.get(
  "/:id",
  requireProjectMember,
  get,
);

router.patch(
  "/:id",
  requireProjectMember,
  requireProjectOwner,
  validate({ body: projectSchema }),
  update,
);

router.delete(
  "/:id",
  requireProjectOwnerOrAdmin,
  remove,
);

router.post(
  "/:id/members",
  requireProjectMember,
  requireProjectOwner,
  addMember,
);

router.delete(
  "/:id/members/:userId",
  requireProjectMember,
  requireProjectOwner,
  removeMember,
);
export default router;