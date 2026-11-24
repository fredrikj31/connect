import { z } from "zod";

// Mirrors database/src/schemas/friend.ts.

export const FriendSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  userId: z.string().min(1),
  friendId: z.string().min(1),
});
export type Friend = z.infer<typeof FriendSchema>;
