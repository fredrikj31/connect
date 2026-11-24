import { z } from "zod";

// Mirrors database/src/schemas/post.ts. Keep the user-facing messages in
// sync; the forms show them as-is.

export const PostSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  userId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(2000, "Content must be 2000 characters or fewer"),
});
export type Post = z.infer<typeof PostSchema>;
