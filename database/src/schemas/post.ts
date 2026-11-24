import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";

/**
 * A text post written by a user. Shown on the author's feed and on the feeds
 * of their friends. Deletes are soft.
 */
export const post = pgTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
  },
  (table) => [index("post_user_id_idx").on(table.userId)],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  // drizzle-zod 0.8 maps timestamp columns to z.any(); tighten them.
  createdAt: () => z.date(),
  updatedAt: () => z.date(),
  deletedAt: () => z.date(),
  userId: (schema: z.ZodString) => schema.min(1),
  // The messages are user-facing: the frontend mirrors them in its forms.
  content: (schema: z.ZodString) =>
    schema
      .trim()
      .min(1, "Content is required")
      .max(2000, "Content must be 2000 characters or fewer"),
};

export const PostSchema = createSelectSchema(post, refinements);
export type Post = z.infer<typeof PostSchema>;
