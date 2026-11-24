import { Database, Post, post } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";

export type PostSummary = Pick<Post, "id" | "userId" | "content" | "createdAt">;

export const createPost = async (
  database: Database,
  values: Pick<Post, "userId" | "content">,
): Promise<PostSummary> => {
  const [row] = await database
    .insert(post)
    .values(values)
    .returning({
      id: post.id,
      userId: post.userId,
      content: post.content,
      createdAt: post.createdAt,
    })
    .catch((error: unknown) => {
      logger.error(error, "Error while creating post.");
      throw new InternalServerError({
        code: "unknown-error-creating-post",
        message: "Unknown error when trying to create post",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating post.");
    throw new InternalServerError({
      code: "post-not-returned-after-insert",
      message: "The post was not returned after being created",
    });
  }

  return row;
};
