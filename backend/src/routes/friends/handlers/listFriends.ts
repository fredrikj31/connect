import { Database } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import {
  FriendWithProfile,
  listFriends,
} from "../../../services/database/queries/friend/listFriends";

interface ListFriendsHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const listFriendsHandler = async ({
  database,
  userId,
}: ListFriendsHandlerOptions): Promise<FriendWithProfile[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  return listFriends(database, { userId });
};
