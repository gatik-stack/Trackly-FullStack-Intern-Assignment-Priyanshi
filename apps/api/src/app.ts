import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
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
  res.json({
    status: "ok",
  });
});

// 404 handler must come after all routes
app.use(notFoundHandler);

// Central error handler must be the last middleware
app.use(errorHandler);

export default app;