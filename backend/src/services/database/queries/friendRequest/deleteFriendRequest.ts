import { Database, friendRequest } from "@connect/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface DeleteFriendRequestOptions {
  id: string;
  senderId: string;
}

/**
 * Withdraws (soft-deletes) a friend request. Only matches requests sent by
 * `senderId` that are not already withdrawn.
 *
 * @returns `true` if a request was withdrawn, `false` if none matched.
 */
export const deleteFriendRequest = async (
  database: Database,
  { id, senderId }: DeleteFriendRequestOptions,
): Promise<boolean> => {
  const rows = await database
    .update(friendRequest)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(friendRequest.id, id),
        eq(friendRequest.senderId, senderId),
        isNull(friendRequest.deletedAt),
      ),
    )
    .returning({ id: friendRequest.id })
    .catch((error: unknown) => {
      logger.error(error, "Error while deleting friend request.");
      throw new InternalServerError({
        code: "unknown-error-deleting-friend-request",
        message: "Unknown error when trying to delete friend request",
      });
    });

  return rows.length > 0;
};
