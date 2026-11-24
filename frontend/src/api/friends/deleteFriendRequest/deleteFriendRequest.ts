import { apiClient } from "../../client";

export interface DeleteFriendRequestOptions {
  requestId: string;
}

export const deleteFriendRequest = async ({
  requestId,
}: DeleteFriendRequestOptions): Promise<void> => {
  await apiClient.delete(`/friends/requests/${requestId}`);
};
