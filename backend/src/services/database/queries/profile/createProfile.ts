import { Database, Profile, profile } from "@connect/database";
import { logger } from "../../../../logger";
import { InternalServerError } from "../../../../errors/server";
import { ConflictError } from "../../../../errors/client";
import { isUniqueViolation } from "../../isUniqueViolation";

export const createProfile = async (
  database: Database,
  values: Pick<
    Profile,
    "userId" | "firstName" | "lastName" | "birthDate" | "gender"
  >,
): Promise<
  Pick<Profile, "userId" | "firstName" | "lastName" | "birthDate" | "gender">
> => {
  const [row] = await database
    .insert(profile)
    .values(values)
    .returning({
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: profile.birthDate,
      gender: profile.gender,
    })
    .catch((error: unknown) => {
      // The user id is the primary key: one profile per user.
      if (isUniqueViolation(error)) {
        throw new ConflictError({
          code: "profile-already-exists",
          message: "The user already has a profile",
        });
      }

      logger.error(error, "Error while creating profile.");
      throw new InternalServerError({
        code: "unknown-error-creating-profile",
        message: "Unknown error when trying to create profile",
      });
    });

  if (!row) {
    logger.error("Insert returned no row while creating profile.");
    throw new InternalServerError({
      code: "profile-not-returned-after-insert",
      message: "The profile was not returned after being created",
    });
  }

  return row;
};
