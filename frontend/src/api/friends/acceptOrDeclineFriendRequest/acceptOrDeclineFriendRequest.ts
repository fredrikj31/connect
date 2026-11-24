import { z } from "zod";
import { apiClient } from "../../client";
import {
  FriendRequest,
  FriendRequestSchema,
} from "../../../types/friendRequest";

export interface AcceptOrDeclineFriendRequestOptions {
  requestId: string;
  status: "accepted" | "declined";
}

export const acceptOrDeclineFriendRequest = async ({
  requestId,
  status,
}: AcceptOrDeclineFriendRequestOptions): Promise<
  Pick<FriendRequest, "id" | "senderId" | "receiverId" | "status" | "createdAt">
> => {
  const response = await apiClient.put<unknown>(
    `/friends/requests/${requestId}`,
    { status },
  );
  return z
    .object({
      data: FriendRequestSchema.pick({
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
        createdAt: true,
      }),
    })
    .parse(response.data).data;
};
