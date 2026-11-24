import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { getPost } from "../../../services/database/queries/post/getPost";
import {
  likePost,
  PostLikeSummary,
} from "../../../services/database/queries/postLike/likePost";

interface LikePostHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { postId: string };
}

export const likePostHandler = async ({
  database,
  userId,
  params,
}: LikePostHandlerOptions): Promise<PostLikeSummary> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const post = await getPost(database, { id: params.postId });
  if (!post) {
    throw new NotFoundError({
      code: "post-not-found",
      message: "The post was not found",
    });
  }

  return likePost(database, { postId: post.id, userId });
};
