import { z } from "zod";
import { apiClient } from "../../client";
import {
  FriendRequest,
  FriendRequestSchema,
} from "../../../types/friendRequest";
import { PublicProfile, PublicProfileSchema } from "../../../types/profile";

export interface SentFriendRequest extends Pick<
  FriendRequest,
  "id" | "status" | "createdAt"
> {
  receiver: PublicProfile;
}

export const listSentFriendRequests = async (): Promise<
  SentFriendRequest[]
> => {
  const response = await apiClient.get<unknown>("/friends/requests/sent");
  return z
    .object({
      data: z.array(
        FriendRequestSchema.pick({
          id: true,
          status: true,
          createdAt: true,
        }).extend({ receiver: PublicProfileSchema }),
      ),
    })
    .parse(response.data).data;
};
