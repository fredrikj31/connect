import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { listReceivedFriendRequests } from "./listReceivedFriendRequests";

export const listReceivedFriendRequestsQueryOptions = queryOptions({
  queryKey: queryKeys.friends.receivedRequests,
  queryFn: listReceivedFriendRequests,
  staleTime: 60 * 1000,
});

export const useListReceivedFriendRequests = () => {
  return useQuery(listReceivedFriendRequestsQueryOptions);
};
