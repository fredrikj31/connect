import { Database } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import {
  listPosts,
  PostWithProfile,
} from "../../../services/database/queries/post/listPosts";

interface ListPostsHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const listPostsHandler = async ({
  database,
  userId,
}: ListPostsHandlerOptions): Promise<PostWithProfile[]> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  return listPosts(database, { userId });
};
