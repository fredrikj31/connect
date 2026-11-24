import { createWriteStream } from "fs";
import { access, mkdir } from "fs/promises";
import { pipeline } from "stream/promises";
import { MultipartFile } from "@fastify/multipart";
import { config } from "../../../config";
import { BadRequestError, UnauthorizedError } from "../../../errors/client";

interface UploadProfilePictureHandlerOptions {
  userId: string | undefined;
  file: MultipartFile;
}

export const uploadProfilePictureHandler = async ({
  userId,
  file,
}: UploadProfilePictureHandlerOptions): Promise<void> => {
  if (!userId) {
    throw new UnauthorizedError({
      code: "user-id-not-found-in-request",
      message: "A user id wasn't found in the request object",
    });
  }

  const folderPath = `${config.uploads.filePath}/profiles/`;

  // Check if file exceeds limits
  if (file.file.truncated) {
    throw new BadRequestError({
      code: "file-size-too-large",
      message: "The uploaded file exceeds the size limit",
    });
  }

  // Check if folder exists, if not create it
  try {
    await access(folderPath);
  } catch {
    await mkdir(folderPath, { recursive: true });
  }

  // Stream the upload to disk, named after the user so it can be served as /profiles/<userId>
  await pipeline(file.file, createWriteStream(`${folderPath}/${userId}`));
};
