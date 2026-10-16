
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { registerSchema } from "@trackly/shared/schemas/auth";
import { validate } from "./middlewares/validate.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post(
  "/api/auth/register",
  validate({ body: registerSchema }),
  (_req, res) => {
    res.status(200).json({ message: "Validation passed" });
  },
);

// 404 handler must come after all routes
app.use(notFoundHandler);

// Central error handler must be the last middleware
app.use(errorHandler);

export default app;
