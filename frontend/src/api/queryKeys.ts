export const queryKeys = {
  accounts: {
    /** The signed-in user's account (id, email, username). */
    me: ["accounts", "me"] as const,
  },
  profiles: {
    /**
     * The signed-in user's profile. `AuthenticatedRouteLayout` reads it as
     * the onboarding gate (404 means "no profile yet") and
     * `useCreateProfile` seeds it after a successful POST.
     */
    me: ["profiles", "me"] as const,
  },
  friends: {
    /** Prefix for every friends query; invalidating it drops the requests too. */
    all: ["friends"] as const,
    list: ["friends", "list"] as const,
    receivedRequests: ["friends", "requests", "received"] as const,
    sentRequests: ["friends", "requests", "sent"] as const,
  },
  posts: {
    /** The feed. `useCreatePost` and `useDeletePost` invalidate it after a mutation. */
    list: ["posts"] as const,
  },
};
