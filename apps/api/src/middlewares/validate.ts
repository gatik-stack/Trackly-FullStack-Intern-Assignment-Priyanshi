import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const details: Record<string, string> = {};

    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(req[source as "body" | "query" | "params"]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path.join(".") || source;
          details[field] = issue.message;
        }
      }
    }

    if (Object.keys(details).length > 0) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      });
      return;
    }

    next();
  };
}
