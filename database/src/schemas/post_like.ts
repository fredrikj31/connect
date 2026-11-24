import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { post } from "./post";

/**
 * A like on a post. One row per (post, user): liking again after an unlike
 * clears `deleted_at` on the existing row instead of inserting a new one.
 */
export const postLike = pgTable(
  "post_like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    postId: uuid("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("post_like_post_id_idx").on(table.postId),
    unique("post_like_post_id_user_id_unique").on(table.postId, table.userId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  postId: () => z.uuid(),
  // drizzle-zod 0.8 maps timestamp columns to z.any(); tighten them.
  createdAt: () => z.date(),
  updatedAt: () => z.date(),
  deletedAt: () => z.date(),
  userId: (schema: z.ZodString) => schema.min(1),
};

export const PostLikeSchema = createSelectSchema(postLike, refinements);
export type PostLike = z.infer<typeof PostLikeSchema>;
