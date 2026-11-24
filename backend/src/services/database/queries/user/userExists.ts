import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/** True when a user with the given id exists. */
export const userExists = async (
  database: Database,
  { id }: { id: string },
): Promise<boolean> => {
  const row = await database.query.user
    .findFirst({
      columns: { id: true },
      where: { id },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while checking if user exists.");
      throw new InternalServerError({
        code: "unknown-error-checking-user-exists",
        message: "Unknown error when trying to check if user exists",
      });
    });

  return row !== undefined;
};
