import fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import { routes } from "./routes/index";
import { config } from "./config";
import { logger } from "./logger";
import { BaseError } from "./errors";
import { swaggerConfig } from "./plugins/swagger";
import { scalarConfig } from "./plugins/scalar";
import { databasePlugin } from "./plugins/database";
import { authPlugin } from "./plugins/auth";

const app: FastifyInstance = fastify({
  logger: true,
});

app
  .register(fastifyCors, {
    origin: config.website.baseUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    maxAge: 86400,
    credentials: true,
  })
  .register(fastifyCookie, {
    parseOptions: {
      path: "/",
      sameSite: true,
    },
  })
  .register(fastifyMultipart)
  .register(fastifySwagger, swaggerConfig)
  .register(import("@scalar/fastify-api-reference"), scalarConfig)
  .register(databasePlugin, {
    dbHost: config.database.host,
    dbPort: config.database.port,
    dbUser: config.database.user,
    dbPassword: config.database.password,
    dbName: config.database.name,
  })
  .register(authPlugin)
  .after(() => {
    app.register(routes, { prefix: "/api" });
  });

app.setErrorHandler((error, _, res) => {
  // Domain errors carry their own status code and `{ code, message }` body.
  if (error instanceof BaseError) {
    return res.status(error.statusCode).send(error.toJSON());
  }

  // Request params/body/query failed the route's Zod schema.
  if (hasZodFastifySchemaValidationErrors(error)) {
    return res.status(400).send({
      code: "invalid-request-payload",
      message: "Invalid payload sent with request",
      issues: error.validation,
    });
  }

  // The handler returned something that does not match the response schema.
  if (isResponseSerializationError(error)) {
    logger.error(
      { issues: error.cause.issues },
      "Response did not match its schema",
    );
    return res.status(500).send({
      code: "invalid-response-payload",
      message: "The response did not match its schema",
    });
  }

  // Errors raised by Fastify itself (unknown route, unsupported media type,
  // multipart limits, ...). Keep their client status, hide server ones.
  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    error.statusCode < 500
  ) {
    return res.status(error.statusCode).send({
      code:
        "code" in error && typeof error.code === "string"
          ? error.code.toLowerCase().replaceAll("_", "-")
          : "request-error",
      message: error.message,
    });
  }

  logger.error({ error }, "Unknown error occurred");
  return res.status(500).send({
    code: "unknown-error",
    message: "An unknown error occurred",
  });
});

app.listen(
  { host: config.api.host, port: config.api.port },
  (err: Error | null) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  },
);

process.on("SIGINT", () => {
  app.log.warn(`SIGINT signal detected, terminating service`);
  void app.close();
});

process.on("SIGTERM", () => {
  app.log.warn(`SIGTERM signal detected, terminating service`);
  void app.close();
});

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}
