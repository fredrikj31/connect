import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { deletePost } from "../../../services/database/queries/post/deletePost";

interface DeletePostHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { postId: string };
}

export const deletePostHandler = async ({
  database,
  userId,
  params,
}: DeletePostHandlerOptions): Promise<void> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const deleted = await deletePost(database, { id: params.postId, userId });

  // A post written by another user is reported as not found on purpose, so
  // the endpoint doesn't reveal whether a given post id exists.
  if (!deleted) {
    throw new NotFoundError({
      code: "post-not-found",
      message: "The post was not found",
    });
  }
};
