import { z } from "zod";
import { FriendRequestStatusSchema } from "./friendRequestStatus";

// Mirrors database/src/schemas/friend_request.ts.

export const FriendRequestSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  status: FriendRequestStatusSchema,
});
export type FriendRequest = z.infer<typeof FriendRequestSchema>;
