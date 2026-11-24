import { apiClient } from "../../client";

export interface UploadProfilePictureOptions {
  profilePicture: File;
}

export const uploadProfilePicture = async ({
  profilePicture,
}: UploadProfilePictureOptions): Promise<void> => {
  const formData = new FormData();
  formData.append("file", profilePicture);

  await apiClient.post("/uploads/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
