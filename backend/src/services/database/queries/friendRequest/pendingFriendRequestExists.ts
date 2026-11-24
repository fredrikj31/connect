import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * True when a pending request already exists between the two users, in
 * either direction.
 */
export const pendingFriendRequestExists = async (
  database: Database,
  { userId, friendId }: { userId: string; friendId: string },
): Promise<boolean> => {
  const row = await database.query.friendRequest
    .findFirst({
      columns: { id: true },
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        status: "PENDING",
        deletedAt: { isNull: true },
      },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while checking for a pending friend request.");
      throw new InternalServerError({
        code: "unknown-error-checking-pending-friend-request",
        message:
          "Unknown error when trying to check for a pending friend request",
      });
    });

  return row !== undefined;
};
