import { Database, Friend } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import {
  PublicProfile,
  toPublicProfile,
} from "../../../../schemas/publicProfile";

export interface FriendWithProfile extends Pick<Friend, "id" | "createdAt"> {
  friend: PublicProfile;
}

/** Lists the friends of a user with their public profiles, newest first. */
export const listFriends = async (
  database: Database,
  { userId }: { userId: string },
): Promise<FriendWithProfile[]> => {
  const rows = await database.query.friend
    .findMany({
      columns: { id: true, createdAt: true },
      where: { userId, deletedAt: { isNull: true } },
      with: {
        friend: {
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
      logger.error(error, "Error while listing friends.");
      throw new InternalServerError({
        code: "unknown-error-listing-friends",
        message: "Unknown error when trying to list friends",
      });
    });

  return rows.flatMap((row) => {
    const profile = toPublicProfile(row.friend);
    return profile
      ? [{ id: row.id, createdAt: row.createdAt, friend: profile }]
      : [];
  });
};
