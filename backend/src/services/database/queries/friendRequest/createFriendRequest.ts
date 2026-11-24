import { Database, FriendRequest, friendRequest } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

export type FriendRequestSummary = Pick<
  FriendRequest,
  "id" | "senderId" | "receiverId" | "status" | "createdAt"
>;

export const createFriendRequest = async (
  database: Database,
  values: Pick<FriendRequest, "senderId" | "receiverId">,
): Promise<FriendRequestSummary> => {
  const [row] = await database
    .insert(friendRequest)
    .values(values)
    .returning({
      id: friendRequest.id,
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while creating friend request.");
      throw new InternalServerError({
        code: "unknown-error-creating-friend-request",
        message: "Unknown error when trying to create friend request",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating friend request.");
    throw new InternalServerError({
      code: "friend-request-not-returned-after-insert",
      message: "The friend request was not returned after being created",
    });
  }

  return row;
};
