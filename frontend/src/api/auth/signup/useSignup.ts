import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { signup } from "./signup";

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof signup>[0]) => {
      return signup(input);
    },
    onSettled: () => {
      // A profile may or may not exist now; let the onboarding gate re-check.
      void queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me });
    },
  });
};
