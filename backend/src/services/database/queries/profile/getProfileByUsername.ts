import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import {
  PublicProfile,
  toPublicProfile,
} from "../../../../schemas/publicProfile";

/**
 * Fetches the public profile of a user by username. better-auth stores
 * usernames lowercased, so callers pass the normalized form.
 *
 * @returns the profile, or `undefined` if no such user exists or they have
 * not created a profile yet.
 */
export const getProfileByUsername = async (
  database: Database,
  { username }: { username: string },
): Promise<PublicProfile | undefined> => {
  const row = await database.query.user
    .findFirst({
      columns: { id: true, username: true },
      where: { username },
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
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while getting profile by username.");
      throw new InternalServerError({
        code: "unknown-error-getting-profile-by-username",
        message: "Unknown error when trying to get profile by username",
      });
    });

  return row ? toPublicProfile(row) : undefined;
};
