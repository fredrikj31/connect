import { Database, FriendRequest, friendRequest } from "@connect/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { FriendRequestSummary } from "./createFriendRequest";

interface UpdateFriendRequestStatusOptions {
  id: string;
  status: Exclude<FriendRequest["status"], "PENDING">;
}

/**
 * Resolves a pending friend request. Only matches requests that are still
 * pending and not withdrawn.
 *
 * @returns the updated request, or `undefined` if no request matched.
 */
export const updateFriendRequestStatus = async (
  database: Database,
  { id, status }: UpdateFriendRequestStatusOptions,
): Promise<FriendRequestSummary | undefined> => {
  const [row] = await database
    .update(friendRequest)
    .set({ status })
    .where(
      and(
        eq(friendRequest.id, id),
        eq(friendRequest.status, "PENDING"),
        isNull(friendRequest.deletedAt),
      ),
    )
    .returning({
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while updating friend request status.");
      throw new InternalServerError({
        code: "unknown-error-updating-friend-request",
        message: "Unknown error when trying to update friend request",
      });
    });

  return row;
};
