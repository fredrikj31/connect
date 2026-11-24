import { authClient } from "../../../auth/client";

export const logout = async (): Promise<void> => {
  const { error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message ?? "Failed to log out");
  }
};
