import { z } from "zod";

// Mirrors the `AccountSchema` in backend/src/routes/accounts/index.ts: the
// signed-in user's own fields from the better-auth `user` table.

export const AccountSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  username: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;
