import { FastifyPluginAsync } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { authRoutes } from "./auth";
import { accountRoutes } from "./accounts";
import { profileRoutes } from "./profiles";
import { friendRoutes } from "./friends";
import { postRoutes } from "./posts";
import { uploadRoutes } from "./uploads";

export const routes: FastifyPluginAsync = async (instance) => {
  instance.setValidatorCompiler(validatorCompiler);
  instance.setSerializerCompiler(serializerCompiler);

  instance.register(authRoutes, { prefix: "/" });
  instance.register(accountRoutes, { prefix: "/accounts" });
  instance.register(profileRoutes, { prefix: "/profiles" });
  instance.register(friendRoutes, { prefix: "/friends" });
  instance.register(postRoutes, { prefix: "/posts" });
  instance.register(uploadRoutes, { prefix: "/uploads" });

  const app = instance.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/healthcheck",
    {
      schema: {
        summary: "Healthcheck Endpoint",
        description: "Pings the server, to test the connection",
        tags: ["healthcheck"],
        response: {
          "200": z.object({ ok: z.boolean() }),
        },
      },
    },
    async (_, res) => {
      return res.send({ ok: true });
    },
  );

  app.get(
    "/docs/json", // Make it available for API docs website to fetch JSON file
    {
      schema: {
        hide: true, // Hide from API & Swagger docs (UI & JSON)
        response: {
          "200": z.any(),
        },
        summary: "Receive Swagger docs in JSON format",
        tags: ["Documentation"],
      },
    },
    async (_, res) => {
      return res.send(app.swagger());
    },
  );
};
