import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  account,
  Database,
  session,
  user,
  verification,
} from "@connect/database";
import { username, openAPI } from "better-auth/plugins";
import { config } from "../config";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const createAuth = (database: Database) =>
  betterAuth({
    baseURL: config.auth.baseUrl,
    secret: config.auth.secret,
    trustedOrigins: [config.website.baseUrl],
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Signed in right away so the frontend can create the profile as the
      // second half of the signup form.
      autoSignIn: true,
      requireEmailVerification: false,
    },
    plugins: [
      username(),
      openAPI({
        disableDefaultReference: true,
      }),
    ],
  });

export type Auth = ReturnType<typeof createAuth>;

const auth = async (fastify: FastifyInstance) => {
  const authClient = createAuth(fastify.database);
  fastify.decorate("auth", authClient);
};

export const authPlugin = fastifyPlugin(auth, {
  name: "auth",
  dependencies: ["database"],
});

declare module "fastify" {
  export interface FastifyInstance {
    auth: Auth;
  }
}
