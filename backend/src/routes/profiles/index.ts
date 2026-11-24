import { ProfileSchema } from "@connect/database";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { validateSession } from "../../hooks/validateSession";
import { PublicProfileSchema } from "../../schemas/publicProfile";
import { createProfileHandler } from "./handlers/createProfile";
import { getProfileHandler } from "./handlers/getProfile";
import { getProfileByUsernameHandler } from "./handlers/getProfileByUsername";

export const profileRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();
  const database = instance.database;

  app.post(
    "/",
    {
      prefixTrailingSlash: "no-slash", // Register as "/profiles", not "/profiles/"
      onRequest: validateSession(),
      schema: {
        summary: "Create profile",
        description:
          "Creates the profile of the signed-in user. Called once right after signup; a user has exactly one profile.",
        tags: ["profiles"],
        security: [{ session: [] }],
        // `userId` comes from the session.
        body: ProfileSchema.pick({
          firstName: true,
          lastName: true,
          birthDate: true,
          gender: true,
        }),
        response: {
          "201": z
            .object({ data: PublicProfileSchema })
            .describe("Returns the created profile."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "409": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const profile = await createProfileHandler({
        database,
        userId,
        body: req.body,
      });
      return res.status(201).send({ data: profile });
    },
  );

  app.get(
    "/me",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Get own profile",
        description:
          "Gets the profile of the signed-in user. Responds 404 `profile-not-found` until the user has created one.",
        tags: ["profiles"],
        security: [{ session: [] }],
        response: {
          "200": z
            .object({ data: PublicProfileSchema })
            .describe("Returns the signed-in user's profile."),
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const profile = await getProfileHandler({ database, userId });
      return res.send({ data: profile });
    },
  );

  app.get(
    "/:username",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Get profile by username",
        description: "Gets the public profile of a user by their username.",
        tags: ["profiles"],
        security: [{ session: [] }],
        params: z.object({ username: z.string().min(1) }),
        response: {
          "200": z
            .object({ data: PublicProfileSchema })
            .describe("Returns the user's profile."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "404": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const profile = await getProfileByUsernameHandler({
        database,
        userId,
        params: req.params,
      });
      return res.send({ data: profile });
    },
  );
};
