import { Database, FriendRequest } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import {
  PublicProfile,
  toPublicProfile,
} from "../../../../schemas/publicProfile";

export interface SentFriendRequest extends Pick<
  FriendRequest,
  "id" | "status" | "createdAt"
> {
  receiver: PublicProfile;
}

/** Lists the pending requests a user has sent, newest first, with the receiver's profile. */
export const listSentFriendRequests = async (
  database: Database,
  { userId }: { userId: string },
): Promise<SentFriendRequest[]> => {
  const rows = await database.query.friendRequest
    .findMany({
      columns: { id: true, status: true, createdAt: true },
      where: {
        senderId: userId,
        status: "PENDING",
        deletedAt: { isNull: true },
      },
      with: {
        receiver: {
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
      logger.error(error, "Error while listing sent friend requests.");
      throw new InternalServerError({
        code: "unknown-error-listing-sent-friend-requests",
        message: "Unknown error when trying to list sent friend requests",
      });
    });

  return rows.flatMap((row) => {
    const receiver = toPublicProfile(row.receiver);
    return receiver
      ? [{ id: row.id, status: row.status, createdAt: row.createdAt, receiver }]
      : [];
  });
};
