import { Database, Post } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

/**
 * Fetches a post by id, ignoring deleted ones.
 *
 * @returns the post, or `undefined` if none matched.
 */
export const getPost = async (
  database: Database,
  { id }: { id: string },
): Promise<Pick<Post, "id" | "userId"> | undefined> => {
  const row = await database.query.post
    .findFirst({
      columns: { id: true, userId: true },
      where: { id, deletedAt: { isNull: true } },
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while getting post.");
      throw new InternalServerError({
        code: "unknown-error-getting-post",
        message: "Unknown error when trying to get post",
      });
    });

  return row;
};
