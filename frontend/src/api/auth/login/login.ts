import { authClient } from "../../../auth/client";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  const { error } = await authClient.signIn.email({ email, password });

  if (error) {
    throw new Error(error.message ?? "Failed to log in");
  }
};
