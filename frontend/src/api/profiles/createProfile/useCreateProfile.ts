import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { createProfile } from "./createProfile";

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof createProfile>[0]) => {
      return createProfile(body);
    },
    onSuccess: (profile) => {
      // Seed the onboarding gate so the layout renders without a refetch.
      queryClient.setQueryData(queryKeys.profiles.me, profile);
    },
  });
};
