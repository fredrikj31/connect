import { z } from "zod";
import { apiClient } from "../../client";
import {
  Profile,
  PublicProfile,
  PublicProfileSchema,
} from "../../../types/profile";

export const createProfile = async (
  body: Pick<Profile, "firstName" | "lastName" | "birthDate" | "gender">,
): Promise<PublicProfile> => {
  const response = await apiClient.post<unknown>("/profiles", body);
  return z.object({ data: PublicProfileSchema }).parse(response.data).data;
};
