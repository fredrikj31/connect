import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { PostLikeSummary } from "../../../services/database/queries/postLike/likePost";
import { unlikePost } from "../../../services/database/queries/postLike/unlikePost";

interface UnlikePostHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { postId: string };
}

export const unlikePostHandler = async ({
  database,
  userId,
  params,
}: UnlikePostHandlerOptions): Promise<PostLikeSummary> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const like = await unlikePost(database, { postId: params.postId, userId });
  if (!like) {
    throw new NotFoundError({
      code: "post-like-not-found",
      message: "You have not liked this post",
    });
  }

  return like;
};
