import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { friendRequestStatusEnum } from "./friend_request_status";

/**
 * A request from `sender_id` to become friends with `receiver_id`. Only the
 * receiver can accept or decline it; the sender can withdraw it, which
 * soft-deletes the row.
 */
export const friendRequest = pgTable(
  "friend_request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: friendRequestStatusEnum("status").notNull().default("PENDING"),
  },
  (table) => [
    index("friend_request_sender_id_idx").on(table.senderId),
    index("friend_request_receiver_id_idx").on(table.receiverId),
  ],
);

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
// `status` needs no refinement: drizzle-zod maps pgEnums to z.enum itself.
const refinements = {
  // drizzle-zod maps uuid columns to plain strings; tighten them.
  id: () => z.uuid(),
  // drizzle-zod 0.8 maps timestamp columns to z.any(); tighten them.
  createdAt: () => z.date(),
  updatedAt: () => z.date(),
  deletedAt: () => z.date(),
  senderId: (schema: z.ZodString) => schema.min(1),
  receiverId: (schema: z.ZodString) => schema.min(1),
};

export const FriendRequestSchema = createSelectSchema(
  friendRequest,
  refinements,
);
export type FriendRequest = z.infer<typeof FriendRequestSchema>;
