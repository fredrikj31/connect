import { Database, postLike } from "@connect/database";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { PostLikeSummary } from "./likePost";

/**
 * Removes (soft-deletes) a user's like on a post.
 *
 * @returns the like, or `undefined` if the user had not liked the post.
 */
export const unlikePost = async (
  database: Database,
  { postId, userId }: { postId: string; userId: string },
): Promise<PostLikeSummary | undefined> => {
  const [row] = await database
    .update(postLike)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(postLike.postId, postId),
        eq(postLike.userId, userId),
        isNull(postLike.deletedAt),
      ),
    )
    .returning({
      id: postLike.id,
      postId: postLike.postId,
      userId: postLike.userId,
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while unliking post.");
      throw new InternalServerError({
        code: "unknown-error-unliking-post",
        message: "Unknown error when trying to unlike post",
      });
    });

  return row;
};
