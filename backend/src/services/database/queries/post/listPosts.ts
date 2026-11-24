import { Database, friend, post, profile, user } from "@connect/database";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { PublicProfile } from "../../../../schemas/publicProfile";
import { PostSummary } from "./createPost";

export interface PostWithProfile extends Omit<PostSummary, "userId"> {
  user: PublicProfile;
}

/**
 * The feed of a user: their own posts and their friends' posts, newest
 * first, each with the author's public profile.
 */
export const listPosts = async (
  database: Database,
  { userId }: { userId: string },
): Promise<PostWithProfile[]> => {
  const friendIds = database
    .select({ id: friend.friendId })
    .from(friend)
    .where(and(eq(friend.userId, userId), isNull(friend.deletedAt)));

  const rows = await database
    .select({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: {
        userId: user.id,
        username: user.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,
        gender: profile.gender,
      },
    })
    .from(post)
    .innerJoin(user, eq(user.id, post.userId))
    .innerJoin(profile, eq(profile.userId, post.userId))
    .where(
      and(
        isNull(post.deletedAt),
        isNull(profile.deletedAt),
        or(eq(post.userId, userId), inArray(post.userId, friendIds)),
      ),
    )
    .orderBy(desc(post.createdAt))
    .catch((error: unknown) => {
      logger.error(error, "Error while listing posts.");
      throw new InternalServerError({
        code: "unknown-error-listing-posts",
        message: "Unknown error when trying to list posts",
      });
    });

  return rows.map((row) => ({
    ...row,
    user: { ...row.user, username: row.user.username ?? "" },
  }));
};
