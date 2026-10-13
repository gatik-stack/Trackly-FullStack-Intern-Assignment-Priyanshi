import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { z } from "zod";
import {
  addComment,
  removeComment,
} from "../controllers/commentController.js";

const router = Router();

router.use(requireAuth);

const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty"),
});

router.post(
  "/tasks/:id/comments",
  validate({ body: createCommentSchema }),
  addComment,
);

router.delete("/comments/:id", removeComment);

export default router;
