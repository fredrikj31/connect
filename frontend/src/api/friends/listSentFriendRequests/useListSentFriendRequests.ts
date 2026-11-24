import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { listSentFriendRequests } from "./listSentFriendRequests";

export const listSentFriendRequestsQueryOptions = queryOptions({
  queryKey: queryKeys.friends.sentRequests,
  queryFn: listSentFriendRequests,
  staleTime: 60 * 1000,
});

export const useListSentFriendRequests = () => {
  return useQuery(listSentFriendRequestsQueryOptions);
};
