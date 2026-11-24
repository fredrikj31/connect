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

/**
 * A friendship edge. Accepting a friend request inserts two rows, one per
 * direction, so "the friends of X" is a single lookup on `user_id`.
 */
export const friend = pgTable(
  "friend",
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
    friendId: text("friend_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("friend_user_id_idx").on(table.userId),
    unique("friend_user_id_friend_id_unique").on(table.userId, table.friendId),
  ],
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
  friendId: (schema: z.ZodString) => schema.min(1),
};

export const FriendSchema = createSelectSchema(friend, refinements);
export type Friend = z.infer<typeof FriendSchema>;
