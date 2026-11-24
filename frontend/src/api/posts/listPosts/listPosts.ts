import { z } from "zod";
import { apiClient } from "../../client";
import { Post, PostSchema } from "../../../types/post";
import { PublicProfile, PublicProfileSchema } from "../../../types/profile";

export interface PostWithProfile extends Pick<
  Post,
  "id" | "content" | "createdAt"
> {
  user: PublicProfile;
}

export const listPosts = async (): Promise<PostWithProfile[]> => {
  const response = await apiClient.get<unknown>("/posts");
  return z
    .object({
      data: z.array(
        PostSchema.pick({ id: true, content: true, createdAt: true }).extend({
          user: PublicProfileSchema,
        }),
      ),
    })
    .parse(response.data).data;
};
