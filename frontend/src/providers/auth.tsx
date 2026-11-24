import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { authClient } from "../auth/client";
import { login } from "../api/auth/login/login";
import { useLogin } from "../api/auth/login/useLogin";
import { useLogout } from "../api/auth/logout/useLogout";
import { signup } from "../api/auth/signup/signup";
import { useSignup } from "../api/auth/signup/useSignup";

type AuthProviderProps = {
  children: ReactNode;
};

type Session = typeof authClient.$Infer.Session;

type AuthProviderValue = {
  isAuthenticated: boolean;
  isPending: boolean;
  user: Session["user"] | null;
  signup: (data: Parameters<typeof signup>[0]) => void;
  login: (data: Parameters<typeof login>[0]) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthProviderValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: signupUser } = useSignup();
  const { mutate: loginUser } = useLogin();
  const { mutate: logoutUser } = useLogout();

  // Derived from the session on every render: no separate state, no effect,
  // no stale window between isPending flipping and the user being available.
  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  const signupAction = useCallback(
    (data: Parameters<typeof signup>[0]) => {
      signupUser(data, {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error signing up!",
            description: error.message,
          });
        },
        onSuccess: () => {
          // Drop anything cached for a previous session (e.g. a 401 on the
          // profile query from logging out) before the layout mounts.
          queryClient.clear();
          toast({
            title: "Successfully signed up!",
            description: "Welcome to the club. You are now signed in.",
          });
          void navigate("/");
        },
      });
    },
    [signupUser, queryClient, toast, navigate],
  );

  const loginAction = useCallback(
    (data: Parameters<typeof login>[0]) => {
      loginUser(data, {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error logging in!",
            description: error.message,
          });
        },
        onSuccess: () => {
          // Drop anything cached for a previous session (e.g. a 401 on the
          // profile query from logging out). authClient.useSession()
          // refetches on its own; just navigate.
          queryClient.clear();
          void navigate("/");
        },
      });
    },
    [loginUser, queryClient, toast, navigate],
  );

  const logoutAction = useCallback(() => {
    logoutUser(undefined, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error logging out!",
          description: error.message,
        });
      },
      onSuccess: () => {
        queryClient.clear();
        void navigate("/login");
      },
    });
  }, [logoutUser, toast, queryClient, navigate]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isPending,
      user,
      signup: signupAction,
      login: loginAction,
      logout: logoutAction,
    }),
    [isAuthenticated, isPending, user, signupAction, loginAction, logoutAction],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider; editing this file triggers a full reload instead of HMR
export const useAuth = (): AuthProviderValue => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};
