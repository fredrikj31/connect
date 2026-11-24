import { queryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../queryKeys";
import { getAccount } from "./getAccount";

export const getAccountQueryOptions = queryOptions({
  queryKey: queryKeys.accounts.me,
  queryFn: getAccount,
  staleTime: 60 * 1000,
});

export const useGetAccount = () => {
  return useQuery(getAccountQueryOptions);
};
