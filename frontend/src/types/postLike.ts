import { z } from "zod";

// Mirrors database/src/schemas/post_like.ts.

export const PostLikeSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  postId: z.uuid(),
  userId: z.string().min(1),
});
export type PostLike = z.infer<typeof PostLikeSchema>;
