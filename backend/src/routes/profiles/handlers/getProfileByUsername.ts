import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { PublicProfile } from "../../../schemas/publicProfile";
import { getProfileByUsername } from "../../../services/database/queries/profile/getProfileByUsername";

interface GetProfileByUsernameHandlerOptions {
  database: Database;
  userId: string | undefined;
  params: { username: string };
}

export const getProfileByUsernameHandler = async ({
  database,
  userId,
  params,
}: GetProfileByUsernameHandlerOptions): Promise<PublicProfile> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  // better-auth stores usernames lowercased.
  const profile = await getProfileByUsername(database, {
    username: params.username.toLowerCase(),
  });
  if (!profile) {
    throw new NotFoundError({
      code: "profile-not-found",
      message: "The profile was not found",
    });
  }

  return profile;
};
