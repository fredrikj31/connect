import { z } from "zod";
import { apiClient } from "../../client";
import { Post, PostSchema } from "../../../types/post";

export const createPost = async (
  body: Pick<Post, "content">,
): Promise<Pick<Post, "id" | "userId" | "content" | "createdAt">> => {
  const response = await apiClient.post<unknown>("/posts", body);
  return z
    .object({
      data: PostSchema.pick({
        id: true,
        userId: true,
        content: true,
        createdAt: true,
      }),
    })
    .parse(response.data).data;
};
