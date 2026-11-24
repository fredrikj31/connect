import { Database, post } from "@connect/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

interface DeletePostOptions {
  id: string;
  userId: string;
}

/**
 * Soft-deletes a post by setting `deletedAt`. Only matches posts written by
 * `userId` that are not already deleted.
 *
 * @returns `true` if a post was deleted, `false` if no post matched.
 */
export const deletePost = async (
  database: Database,
  { id, userId }: DeletePostOptions,
): Promise<boolean> => {
  const rows = await database
    .update(post)
    .set({ deletedAt: new Date() })
    .where(
      and(eq(post.id, id), eq(post.userId, userId), isNull(post.deletedAt)),
    )
    .returning({ id: post.id })
    .catch((error: unknown) => {
      logger.error(error, "Error while deleting post.");
      throw new InternalServerError({
        code: "unknown-error-deleting-post",
        message: "Unknown error when trying to delete post",
      });
    });

  return rows.length > 0;
};
