import { Database, Post } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import {
  createPost,
  PostSummary,
} from "../../../services/database/queries/post/createPost";

interface CreatePostHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: Pick<Post, "content">;
}

export const createPostHandler = async ({
  database,
  userId,
  body,
}: CreatePostHandlerOptions): Promise<PostSummary> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  return createPost(database, { ...body, userId });
};
