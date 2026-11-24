import { MultipartFile } from "@fastify/multipart";
import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ApiErrorSchema } from "../../errors";
import { BadRequestError } from "../../errors/client";
import { validateSession } from "../../hooks/validateSession";
import { uploadProfilePictureHandler } from "./handlers/uploadProfilePicture";

const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

export const uploadRoutes: FastifyPluginAsync = async (instance) => {
  const app = instance.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/profile-picture",
    {
      onRequest: validateSession(),
      schema: {
        summary: "Upload profile picture",
        description:
          "Uploads the profile picture of the signed-in user (one image, at most 5 MB). It is served by the assets server under `/profiles/<userId>`.",
        tags: ["uploads"],
        security: [{ session: [] }],
        consumes: ["multipart/form-data"],
        // Documented as a binary `file` field by the swagger transform.
        body: z.custom<MultipartFile>(),
        response: {
          "204": z.undefined().describe("The profile picture was stored."),
          "400": ApiErrorSchema,
          "401": ApiErrorSchema,
          "500": ApiErrorSchema,
        },
      },
    },
    async (req, res) => {
      const userId = req.userId;
      const file = await req.file({
        limits: { fileSize: PROFILE_PICTURE_MAX_BYTES, files: 1 },
        throwFileSizeLimit: true,
      });
      if (!file) {
        throw new BadRequestError({
          code: "file-not-found-in-request",
          message: "No file was found in the request",
        });
      }

      await uploadProfilePictureHandler({ userId, file });
      return res.status(204).send(undefined);
    },
  );
};
