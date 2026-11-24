import { Database } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import {
  listReceivedFriendRequests,
  ReceivedFriendRequest,
} from "../../../services/database/queries/friendRequest/listReceivedFriendRequests";

interface ListReceivedFriendRequestsHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const listReceivedFriendRequestsHandler = async ({
  database,
  userId,
}: ListReceivedFriendRequestsHandlerOptions): Promise<
  ReceivedFriendRequest[]
> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  return listReceivedFriendRequests(database, { userId });
};
