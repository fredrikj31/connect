import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { listPosts } from "./listPosts";

export const listPostsQueryOptions = queryOptions({
  queryKey: queryKeys.posts.list,
  queryFn: listPosts,
  staleTime: 60 * 1000,
});

export const useListPosts = () => {
  return useQuery(listPostsQueryOptions);
};
