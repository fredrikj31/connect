import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Lifecycle of a `friend_request`. A request starts as `PENDING` and is
 * resolved by the receiver to `ACCEPTED` (which also creates the `friend`
 * rows) or `DECLINED`. Withdrawn requests are soft-deleted instead.
 */
export const FRIEND_REQUEST_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
] as const;
export type FriendRequestStatus = (typeof FRIEND_REQUEST_STATUSES)[number];

export const friendRequestStatusEnum = pgEnum(
  "friend_request_status",
  FRIEND_REQUEST_STATUSES,
);
