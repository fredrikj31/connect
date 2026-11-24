import { Database } from "@connect/database";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/client";
import { friendExists } from "../../../services/database/queries/friend/friendExists";
import {
  createFriendRequest,
  FriendRequestSummary,
} from "../../../services/database/queries/friendRequest/createFriendRequest";
import { pendingFriendRequestExists } from "../../../services/database/queries/friendRequest/pendingFriendRequestExists";
import { userExists } from "../../../services/database/queries/user/userExists";

interface CreateFriendRequestHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: { friendId: string };
}

export const createFriendRequestHandler = async ({
  database,
  userId,
  body,
}: CreateFriendRequestHandlerOptions): Promise<FriendRequestSummary> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  if (body.friendId === userId) {
    throw new BadRequestError({
      code: "friend-request-to-self",
      message: "You can't send a friend request to yourself",
    });
  }

  if (!(await userExists(database, { id: body.friendId }))) {
    throw new NotFoundError({
      code: "user-not-found",
      message: "The user was not found",
    });
  }

  if (await friendExists(database, { userId, friendId: body.friendId })) {
    throw new ConflictError({
      code: "already-friends",
      message: "You are already friends with this user",
    });
  }

  if (
    await pendingFriendRequestExists(database, {
      userId,
      friendId: body.friendId,
    })
  ) {
    throw new ConflictError({
      code: "friend-request-already-exists",
      message: "There is already a pending friend request between you",
    });
  }

  return createFriendRequest(database, {
    senderId: userId,
    receiverId: body.friendId,
  });
};
