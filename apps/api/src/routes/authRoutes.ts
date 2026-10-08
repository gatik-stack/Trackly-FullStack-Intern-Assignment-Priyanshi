import { loginRateLimiter } from "../middlewares/rateLimiter.js";
import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import {
  loginSchema,
  registerSchema,
} from "@trackly/shared";
import { requireAuth } from "../middlewares/auth.js";
const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  register,
);

router.post(
  "/login",
  loginRateLimiter,
  validate({ body: loginSchema }),
  login,
);
 
router.post(
  "/logout",
  logout,
); 

router.get(
  "/me",
  requireAuth,
  me,
);

export default router;