import { Database } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import {
  listSentFriendRequests,
  SentFriendRequest,
} from "../../../services/database/queries/friendRequest/listSentFriendRequests";

interface ListSentFriendRequestsHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const listSentFriendRequestsHandler = async ({
  database,
  userId,
}: ListSentFriendRequestsHandlerOptions): Promise<SentFriendRequest[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  return listSentFriendRequests(database, { userId });
};
