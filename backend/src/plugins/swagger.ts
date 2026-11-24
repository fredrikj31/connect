import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { config } from "../config";

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument -- walks an untyped OpenAPI document */
/**
 * Routes that consume `multipart/form-data` declare their body as
 * `z.custom<MultipartFile>()`, which has no JSON Schema representation.
 * Document them as a single binary `file` field instead.
 */
const normalizeFileFields = (obj: Record<string, any>) => {
  let routeContainsFile = false;

  if (
    Object.hasOwn(obj, "consumes") &&
    obj.consumes.includes("multipart/form-data")
  ) {
    routeContainsFile = true;
  }

  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (key === "body" && routeContainsFile) {
        obj[key] = {
          type: "object",
          required: ["file"],
          properties: {
            file: { type: "string", format: "binary" },
          },
        };
      } else {
        normalizeFileFields(obj[key]);
      }
    }
  }

  return obj;
};
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Connect API",
      description: 'The main and only API behind "connect"',
      version: "0.0.1",
    },
    externalDocs: {
      url: "https://github.com/fredrikj31/connect",
      description: "Find more info here",
    },
    servers: [
      {
        url: `http://127.0.0.1:${config.api.port}/api`,
        description: "Local running API",
      },
    ],
    components: {
      securitySchemes: {
        session: {
          name: "better-auth.session_token",
          in: "cookie",
          type: "apiKey",
          description: "Authentication with your better-auth session cookie",
        },
      },
    },
  },
  transform: (data) => {
    const jsonSchema = jsonSchemaTransform(data);

    normalizeFileFields(jsonSchema.schema);

    return jsonSchema;
  },
};
