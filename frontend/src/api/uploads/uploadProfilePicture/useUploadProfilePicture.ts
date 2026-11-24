import { useMutation } from "@tanstack/react-query";
import { uploadProfilePicture } from "./uploadProfilePicture";

export const useUploadProfilePicture = () => {
  return useMutation({
    mutationFn: (options: Parameters<typeof uploadProfilePicture>[0]) => {
      return uploadProfilePicture(options);
    },
  });
};
