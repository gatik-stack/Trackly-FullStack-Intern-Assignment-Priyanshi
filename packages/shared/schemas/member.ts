import { z } from "zod";

export const memberSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  role: z.enum(["MEMBER", "OWNER"]).default("MEMBER"),
});

export type MemberInput = z.infer<typeof memberSchema>;
