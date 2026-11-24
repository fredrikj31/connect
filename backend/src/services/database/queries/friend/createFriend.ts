import { Database, Friend, friend } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * Inserts one direction of a friendship. Accepting a request calls this
 * twice (A -> B and B -> A). An existing edge is left untouched, so
 * re-accepting is harmless.
 */
export const createFriend = async (
  database: Database,
  values: Pick<Friend, "userId" | "friendId">,
): Promise<void> => {
  await database
    .insert(friend)
    .values(values)
    .onConflictDoNothing({ target: [friend.userId, friend.friendId] })
    .catch((error: unknown) => {
      logger.error(error, "Error while creating friend.");
      throw new InternalServerError({
        code: "unknown-error-creating-friend",
        message: "Unknown error when trying to create friend",
      });
    });
};
