import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { acceptOrDeclineFriendRequest } from "./acceptOrDeclineFriendRequest";

export const useAcceptOrDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      options: Parameters<typeof acceptOrDeclineFriendRequest>[0],
    ) => {
      return acceptOrDeclineFriendRequest(options);
    },
    onSuccess: () => {
      // Accepting changes the friends list too, so drop the whole prefix.
      void queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
};
