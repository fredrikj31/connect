import { apiClient } from "../../client";

export interface DeletePostOptions {
  postId: string;
}

export const deletePost = async ({
  postId,
}: DeletePostOptions): Promise<void> => {
  await apiClient.delete(`/posts/${postId}`);
};
