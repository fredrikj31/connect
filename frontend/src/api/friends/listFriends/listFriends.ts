import { z } from "zod";
import { apiClient } from "../../client";
import { Friend, FriendSchema } from "../../../types/friend";
import { PublicProfile, PublicProfileSchema } from "../../../types/profile";

export interface FriendWithProfile extends Pick<Friend, "id" | "createdAt"> {
  friend: PublicProfile;
}

export const listFriends = async (): Promise<FriendWithProfile[]> => {
  const response = await apiClient.get<unknown>("/friends");
  return z
    .object({
      data: z.array(
        FriendSchema.pick({ id: true, createdAt: true }).extend({
          friend: PublicProfileSchema,
        }),
      ),
    })
    .parse(response.data).data;
};
