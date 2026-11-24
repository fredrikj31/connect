import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { listFriends } from "./listFriends";

export const listFriendsQueryOptions = queryOptions({
  queryKey: queryKeys.friends.list,
  queryFn: listFriends,
  staleTime: 60 * 1000,
});

export const useListFriends = () => {
  return useQuery(listFriendsQueryOptions);
};
