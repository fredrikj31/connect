import { z } from "zod";
import { apiClient } from "../../client";
import {
  FriendRequest,
  FriendRequestSchema,
} from "../../../types/friendRequest";
import { PublicProfile, PublicProfileSchema } from "../../../types/profile";

export interface ReceivedFriendRequest extends Pick<
  FriendRequest,
  "id" | "status" | "createdAt"
> {
  sender: PublicProfile;
}

export const listReceivedFriendRequests = async (): Promise<
  ReceivedFriendRequest[]
> => {
  const response = await apiClient.get<unknown>("/friends/requests/received");
  return z
    .object({
      data: z.array(
        FriendRequestSchema.pick({
          id: true,
          status: true,
          createdAt: true,
        }).extend({ sender: PublicProfileSchema }),
      ),
    })
    .parse(response.data).data;
};
