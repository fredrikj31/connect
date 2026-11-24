import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { deleteFriendRequest } from "../../../services/database/queries/friendRequest/deleteFriendRequest";

interface DeleteFriendRequestHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { requestId: string };
}

export const deleteFriendRequestHandler = async ({
  database,
  userId,
  params,
}: DeleteFriendRequestHandlerOptions): Promise<void> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const deleted = await deleteFriendRequest(database, {
    id: params.requestId,
    senderId: userId,
  });

  // A request sent by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given request id exists.
  if (!deleted) {
    throw new NotFoundError({
      code: "friend-request-not-found",
      message: "The friend request was not found",
    });
  }
};
