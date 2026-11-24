import { Database } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/** True when `userId` and `friendId` are already friends. */
export const friendExists = async (
  database: Database,
  { userId, friendId }: { userId: string; friendId: string },
): Promise<boolean> => {
  const row = await database.query.friend
    .findFirst({
      columns: { id: true },
      where: { userId, friendId, deletedAt: { isNull: true } },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while checking if friend exists.");
      throw new InternalServerError({
        code: "unknown-error-checking-friend-exists",
        message: "Unknown error when trying to check if friend exists",
      });
    });

  return row !== undefined;
};
