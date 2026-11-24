import { Database } from "@connect/database";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/client";
import { createFriend } from "../../../services/database/queries/friend/createFriend";
import { FriendRequestSummary } from "../../../services/database/queries/friendRequest/createFriendRequest";
import { getFriendRequest } from "../../../services/database/queries/friendRequest/getFriendRequest";
import { updateFriendRequestStatus } from "../../../services/database/queries/friendRequest/updateFriendRequestStatus";

interface AcceptFriendRequestHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { requestId: string };
}

export const acceptFriendRequestHandler = async ({
  database,
  userId,
  params,
}: AcceptFriendRequestHandlerOptions): Promise<FriendRequestSummary> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const request = await getFriendRequest(database, { id: params.requestId });

  // A request received by another user is reported as not found on purpose,
  // so the endpoint doesn't reveal whether a given request id exists.
  if (!request || request.receiverId !== userId) {
    throw new NotFoundError({
      code: "friend-request-not-found",
      message: "The friend request was not found",
    });
  }

  if (request.status !== "PENDING") {
    throw new ConflictError({
      code: "friend-request-not-pending",
      message: "The friend request has already been resolved",
    });
  }

  return database.transaction(async (transaction) => {
    const accepted = await updateFriendRequestStatus(transaction, {
      id: request.id,
      status: "ACCEPTED",
    });

    // Resolved by a concurrent request between the read above and now.
    if (!accepted) {
      throw new ConflictError({
        code: "friend-request-not-pending",
        message: "The friend request has already been resolved",
      });
    }

    // Friendship is stored as one row per direction.
    await createFriend(transaction, {
      userId: accepted.senderId,
      friendId: accepted.receiverId,
    });
    await createFriend(transaction, {
      userId: accepted.receiverId,
      friendId: accepted.senderId,
    });

    return accepted;
  });
};
