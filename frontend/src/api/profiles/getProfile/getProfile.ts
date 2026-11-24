import { z } from "zod";
import { apiClient } from "../../client";
import { PublicProfile, PublicProfileSchema } from "../../../types/profile";

/** Fails with a 404 `profile-not-found` until the user has created their profile. */
export const getProfile = async (): Promise<PublicProfile> => {
  const response = await apiClient.get<unknown>("/profiles/me");
  return z.object({ data: PublicProfileSchema }).parse(response.data).data;
};
