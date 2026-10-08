import { z } from "zod";

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment is required"),
});

export type CommentInput = z.infer<typeof commentSchema>;
