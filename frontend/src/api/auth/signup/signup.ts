import { authClient } from "../../../auth/client";
import { Profile } from "../../../types/profile";
import { createProfile } from "../../profiles/createProfile/createProfile";

export interface SignupInput extends Pick<
  Profile,
  "firstName" | "lastName" | "birthDate" | "gender"
> {
  email: string;
  username: string;
  password: string;
}

/**
 * Creates the better-auth user (which signs the browser in) and then the
 * profile. If the second step fails the user is still signed in and the
 * authenticated layout sends them to `/onboarding` to finish it.
 */
export const signup = async ({
  email,
  username,
  password,
  firstName,
  lastName,
  birthDate,
  gender,
}: SignupInput): Promise<void> => {
  const { error } = await authClient.signUp.email({
    email,
    password,
    username,
    name: `${firstName} ${lastName}`,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to sign up");
  }

  await createProfile({ firstName, lastName, birthDate, gender });
};
