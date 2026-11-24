import { Database } from "@connect/database";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/client";
import { FriendRequestSummary } from "../../../services/database/queries/friendRequest/createFriendRequest";
import { getFriendRequest } from "../../../services/database/queries/friendRequest/getFriendRequest";
import { updateFriendRequestStatus } from "../../../services/database/queries/friendRequest/updateFriendRequestStatus";

interface DeclineFriendRequestHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { requestId: string };
}

export const declineFriendRequestHandler = async ({
  database,
  userId,
  params,
}: DeclineFriendRequestHandlerOptions): Promise<FriendRequestSummary> => {
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

  const declined = await updateFriendRequestStatus(database, {
    id: request.id,
    status: "DECLINED",
  });

  if (!declined) {
    throw new ConflictError({
      code: "friend-request-not-pending",
      message: "The friend request has already been resolved",
    });
  }

  return declined;
};
