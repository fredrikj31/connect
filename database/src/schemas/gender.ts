import { pgEnum } from "drizzle-orm/pg-core";

/**
 * How a user identifies. Stored on `profile.gender`; `PREFER_NOT_TO_SAY` is
 * the explicit opt-out so the column can stay `NOT NULL`.
 */
export const GENDERS = ["MALE", "FEMALE", "PREFER_NOT_TO_SAY"] as const;
export type Gender = (typeof GENDERS)[number];

export const genderEnum = pgEnum("gender", GENDERS);
