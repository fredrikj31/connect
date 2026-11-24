import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { FriendRequestSummary } from "./createFriendRequest";

/**
 * Fetches a friend request by id, ignoring withdrawn (soft-deleted) ones.
 *
 * @returns the request, or `undefined` if none matched.
 */
export const getFriendRequest = async (
  database: Database,
  { id }: { id: string },
): Promise<FriendRequestSummary | undefined> => {
  const row = await database.query.friendRequest
    .findFirst({
      columns: {
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
        createdAt: true,
      },
      where: { id, deletedAt: { isNull: true } },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while getting friend request.");
      throw new InternalServerError({
        code: "unknown-error-getting-friend-request",
        message: "Unknown error when trying to get friend request",
      });
    });

  return row;
};
