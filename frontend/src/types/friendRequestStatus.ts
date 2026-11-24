import { z } from "zod";

// Mirrors database/src/schemas/friend_request_status.ts.

export const FRIEND_REQUEST_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
] as const;
export const FriendRequestStatusSchema = z.enum(FRIEND_REQUEST_STATUSES);
export type FriendRequestStatus = z.infer<typeof FriendRequestStatusSchema>;
