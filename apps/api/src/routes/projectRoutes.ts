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
} from "@trackly/shared";

const router = Router();

router.use(requireAuth);

// GET /api/projects
router.get(
  "/",
  validate({ query: projectListQuerySchema }),
  list,
);

// POST /api/projects
router.post(
  "/",
  validate({ body: projectSchema }),
  create,
);

// GET /api/projects/:id
router.get(
  "/:id",
  requireProjectMember,
  get,
);

// PATCH /api/projects/:id
router.patch(
  "/:id",
  requireProjectMember,
  requireProjectOwner,
  validate({ body: projectSchema }),
  update,
);

// DELETE /api/projects/:id
router.delete(
  "/:id",
  requireProjectOwnerOrAdmin,
  remove,
);

export default router;