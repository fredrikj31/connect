import { Database } from "@connect/database";
import { NotFoundError, UnauthorizedError } from "../../../errors/client";
import { PublicProfile } from "../../../schemas/publicProfile";
import { getProfile } from "../../../services/database/queries/profile/getProfile";

interface GetProfileHandlerOptions {
  database: Database;
  userId: string | undefined;
}

export const getProfileHandler = async ({
  database,
  userId,
}: GetProfileHandlerOptions): Promise<PublicProfile> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const profile = await getProfile(database, { userId });
  if (!profile) {
    throw new NotFoundError({
      code: "profile-not-found",
      message: "The profile was not found",
    });
  }

  return profile;
};
