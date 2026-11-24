import { ProfileSchema } from "@connect/database";
import { z } from "zod";

/**
 * What other users see of a user: the `profile` row plus the username from
 * the better-auth `user` table. Returned by the profile routes and embedded
 * in posts, friends and friend requests.
 */
export const PublicProfileSchema = ProfileSchema.pick({
  userId: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  gender: true,
}).extend({
  username: z.string(),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

/** The `user` columns and nested `profile` a query must select to build a `PublicProfile`. */
export interface PublicProfileRow {
  id: string;
  username: string | null;
  profile: Pick<
    PublicProfile,
    "firstName" | "lastName" | "birthDate" | "gender"
  > | null;
}

/**
 * Maps a `user` row (with its `profile` relation) to a `PublicProfile`.
 *
 * @returns `undefined` when the user has not created a profile yet.
 */
export const toPublicProfile = (
  row: PublicProfileRow,
): PublicProfile | undefined => {
  if (!row.profile) {
    return undefined;
  }

  return {
    userId: row.id,
    username: row.username ?? "",
    firstName: row.profile.firstName,
    lastName: row.profile.lastName,
    birthDate: row.profile.birthDate,
    gender: row.profile.gender,
  };
};
