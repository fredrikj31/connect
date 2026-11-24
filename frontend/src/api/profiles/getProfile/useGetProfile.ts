import { queryOptions, useQuery } from "@tanstack/react-query";
import { ApiError } from "../../errors";
import { queryKeys } from "../../queryKeys";
import { getProfile } from "./getProfile";

/** True when the user has not created their profile yet. */
export const isProfileNotFound = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status === 404 &&
  error.code === "profile-not-found";

export const getProfileQueryOptions = queryOptions({
  queryKey: queryKeys.profiles.me,
  queryFn: getProfile,
  staleTime: 5 * 60 * 1000,
  // "Not found" is the expected answer for a user who hasn't onboarded, so
  // don't sit through the default retry backoff before redirecting them.
  retry: (failureCount, error) => !isProfileNotFound(error) && failureCount < 3,
  // The layout gate and the onboarding page share this query; once it has
  // answered "not found" the page mounting right after shouldn't ask again.
  retryOnMount: false,
});

interface UseGetProfileOptions {
  enabled?: boolean;
}

export const useGetProfile = (options?: UseGetProfileOptions) => {
  return useQuery({
    ...getProfileQueryOptions,
    enabled: options?.enabled ?? true,
  });
};
