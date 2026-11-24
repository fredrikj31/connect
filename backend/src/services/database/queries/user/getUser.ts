import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

export interface User {
  id: string;
  email: string;
  username: string | null;
}

/**
 * Fetches the account fields of a user by id.
 *
 * @returns the user, or `undefined` if no user matched.
 */
export const getUser = async (
  database: Database,
  { id }: { id: string },
): Promise<User | undefined> => {
  const row = await database.query.user
    .findFirst({
      columns: { id: true, email: true, username: true },
      where: { id },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while getting user.");
      throw new InternalServerError({
        code: "unknown-error-getting-user",
        message: "Unknown error when trying to get user",
      });
    });

  return row;
};
