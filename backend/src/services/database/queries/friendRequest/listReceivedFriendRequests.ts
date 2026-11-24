import { Database, FriendRequest } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import {
  PublicProfile,
  toPublicProfile,
} from "../../../../schemas/publicProfile";

export interface ReceivedFriendRequest extends Pick<
  FriendRequest,
  "id" | "status" | "createdAt"
> {
  sender: PublicProfile;
}

/** Lists the pending requests sent to a user, newest first, with the sender's profile. */
export const listReceivedFriendRequests = async (
  database: Database,
  { userId }: { userId: string },
): Promise<ReceivedFriendRequest[]> => {
  const rows = await database.query.friendRequest
    .findMany({
      columns: { id: true, status: true, createdAt: true },
      where: {
        receiverId: userId,
        status: "PENDING",
        deletedAt: { isNull: true },
      },
      with: {
        sender: {
          columns: { id: true, username: true },
          with: {
            profile: {
              columns: {
                firstName: true,
                lastName: true,
                birthDate: true,
                gender: true,
              },
              where: { deletedAt: { isNull: true } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while listing received friend requests.");
      throw new InternalServerError({
        code: "unknown-error-listing-received-friend-requests",
        message: "Unknown error when trying to list received friend requests",
      });
    });

  return rows.flatMap((row) => {
    const sender = toPublicProfile(row.sender);
    return sender
      ? [{ id: row.id, status: row.status, createdAt: row.createdAt, sender }]
      : [];
  });
};
