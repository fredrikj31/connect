import { Database, PostLike, postLike } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

export type PostLikeSummary = Pick<PostLike, "id" | "postId" | "userId">;

/**
 * Likes a post. One row per (post, user): liking again after an unlike
 * revives the existing row instead of inserting a new one.
 */
export const likePost = async (
  database: Database,
  values: Pick<PostLike, "postId" | "userId">,
): Promise<PostLikeSummary> => {
  const [row] = await database
    .insert(postLike)
    .values(values)
    .onConflictDoUpdate({
      target: [postLike.postId, postLike.userId],
      set: { deletedAt: null, updatedAt: new Date() },
    })
    .returning({
      id: postLike.id,
      postId: postLike.postId,
      userId: postLike.userId,
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while liking post.");
      throw new InternalServerError({
        code: "unknown-error-liking-post",
        message: "Unknown error when trying to like post",
      });
    });

  if (!row) {
    logger.error("Upsert returned no row while liking post.");
    throw new InternalServerError({
      code: "post-like-not-returned-after-upsert",
      message: "The like was not returned after being created",
    });
  }

  return row;
};
