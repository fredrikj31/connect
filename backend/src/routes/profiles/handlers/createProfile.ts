import { Database, Profile } from "@connect/database";
import { UnauthorizedError } from "../../../errors/client";
import { InternalServerError } from "../../../errors/server";
import { PublicProfile } from "../../../schemas/publicProfile";
import { createProfile } from "../../../services/database/queries/profile/createProfile";
import { getProfile } from "../../../services/database/queries/profile/getProfile";

interface CreateProfileHandlerOptions {
  database: Database;
  userId: string | undefined;
  body: Pick<Profile, "firstName" | "lastName" | "birthDate" | "gender">;
}

export const createProfileHandler = async ({
  database,
  userId,
  body,
}: CreateProfileHandlerOptions): Promise<PublicProfile> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  await createProfile(database, { ...body, userId });

  // Re-read through the user so the response carries the username too.
  const profile = await getProfile(database, { userId });
  if (!profile) {
    throw new InternalServerError({
      code: "profile-not-found-after-insert",
      message: "The profile was not found after being created",
    });
  }

  return profile;
};
