import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { deleteFriendRequest } from "./deleteFriendRequest";

export const useDeleteFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: Parameters<typeof deleteFriendRequest>[0]) => {
      return deleteFriendRequest(options);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.friends.sentRequests,
      });
    },
  });
};
