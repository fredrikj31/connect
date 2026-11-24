import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import {
  PublicProfile,
  toPublicProfile,
} from "../../../../schemas/publicProfile";

/**
 * Fetches the public profile of a user by id.
 *
 * @returns the profile, or `undefined` if the user does not exist or has
 * not created a profile yet.
 */
export const getProfile = async (
  database: Database,
  { userId }: { userId: string },
): Promise<PublicProfile | undefined> => {
  const row = await database.query.user
    .findFirst({
      columns: { id: true, username: true },
      where: { id: userId },
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
      logger.error(error, "Error while getting profile.");
      throw new InternalServerError({
        code: "unknown-error-getting-profile",
        message: "Unknown error when trying to get profile",
      });
    });

  return row ? toPublicProfile(row) : undefined;
};
