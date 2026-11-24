import { z } from "zod";
import { GenderSchema } from "./gender";

// Mirrors database/src/schemas/profile.ts. The frontend doesn't depend on
// the database package, so the entity is declared here; keep it in sync,
// including the user-facing messages, which the forms show as-is.
// Request and response shapes are derived from it with pick / omit.

export const ProfileSchema = z.object({
  userId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(255, "First name must be 255 characters or fewer"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(255, "Last name must be 255 characters or fewer"),
  birthDate: z.iso.date("Birth date must be a date (YYYY-MM-DD)"),
  gender: GenderSchema,
});
export type Profile = z.infer<typeof ProfileSchema>;

// Mirrors the better-auth username plugin rules: 3-30 characters of letters,
// digits, underscores and dots. Stored lowercased.
export const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be 30 characters or fewer")
  .regex(
    /^[a-zA-Z0-9_.]+$/,
    "Username may only contain letters, digits, underscores and dots",
  );

/**
 * What other users see of a user: the profile plus the username. Mirrors
 * backend/src/schemas/publicProfile.ts.
 */
export const PublicProfileSchema = ProfileSchema.pick({
  userId: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  gender: true,
}).extend({
  username: z.string(),
});
export type PublicProfile = z.infer<typeof PublicProfileSchema>;
