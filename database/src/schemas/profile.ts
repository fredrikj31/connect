import { date, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { genderEnum } from "./gender";

/**
 * Public profile of a user. One row per user, keyed by the user id, created
 * right after signup (the onboarding gate sends users without one to
 * `/onboarding`). Email and username live on the better-auth `user` table.
 * Deleting the user removes the row.
 */
export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  birthDate: date("birth_date").notNull(),
  gender: genderEnum("gender").notNull(),
});

// ---------------------------------------------------------------------------
// Zod schemas (shared by backend & frontend)
// ---------------------------------------------------------------------------

// Callback form so drizzle-zod still wraps nullable columns in `.nullable()`.
// `gender` needs no refinement: drizzle-zod maps pgEnums to z.enum itself.
const refinements = {
  userId: (schema: z.ZodString) => schema.min(1),
  // drizzle-zod 0.8 maps timestamp and date columns to z.any(); tighten them.
  createdAt: () => z.date(),
  updatedAt: () => z.date(),
  deletedAt: () => z.date(),
  // The messages are user-facing: the frontend mirrors them in its forms.
  firstName: (schema: z.ZodString) =>
    schema
      .trim()
      .min(1, "First name is required")
      .max(255, "First name must be 255 characters or fewer"),
  lastName: (schema: z.ZodString) =>
    schema
      .trim()
      .min(1, "Last name is required")
      .max(255, "Last name must be 255 characters or fewer"),
  birthDate: () => z.iso.date("Birth date must be a date (YYYY-MM-DD)"),
};

export const ProfileSchema = createSelectSchema(profile, refinements);
export type Profile = z.infer<typeof ProfileSchema>;
