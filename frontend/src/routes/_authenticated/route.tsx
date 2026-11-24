import { Navigate, Outlet } from "react-router";
import { Skeleton } from "@shadcn-ui/components/ui/skeleton";
import { useAuth } from "../../providers/auth";
import { Navbar } from "../../components/Navbar";
import {
  isProfileNotFound,
  useGetProfile,
} from "../../api/profiles/getProfile/useGetProfile";

export const AuthenticatedRouteLayout = () => {
  const { isAuthenticated, isPending } = useAuth();
  // Onboarding gate: a user without a profile hasn't finished signing up.
  const profile = useGetProfile({ enabled: isAuthenticated });

  if (isPending) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile.isPending) {
    return (
      <div className="flex flex-col w-full px-4 mg:container py-7 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full max-w-3xl self-center" />
      </div>
    );
  }

  if (profile.isError) {
    if (isProfileNotFound(profile.error)) {
      return <Navigate to="/onboarding" replace />;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6">
        <h1 className="text-xl font-semibold">Could not load your profile</h1>
        <p className="text-muted-foreground">{profile.error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 mg:container">
      <Navbar />
      <Outlet />
    </div>
  );
};
