import { createContext, useContext, useEffect, useMemo, useState } from "react";
import cookies from "js-cookie";
import { Profile } from "../types/profile";
import { useLoginUser } from "../api/actions/login/useLoginUser";
import { decodeJwtToken } from "../helpers/decodeJwtToken";
import { useNavigate } from "react-router";
import { useSignupUser } from "../api/actions/signup/useSignupUser";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { ToastAction } from "@shadcn-ui/components/ui/toast";
import { useLogoutUser } from "../api/actions/logout/useLogoutUser";
import { refreshToken } from "../api/actions/refreshToken";
import { Account } from "../types/account";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthProviderValue = {
  isAuthenticated: boolean;
  userId: string | undefined;
  // Methods
  login: (data: Pick<Account, "email" | "password">) => void;
  signup: (
    data: Pick<Account, "email" | "password"> &
      Omit<Profile, "userId" | "createdAt" | "updatedAt" | "deletedAt">,
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthProviderValue | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(
    cookies.get("access_token"),
  );
  const refreshTokenCookie = cookies.get("refresh_token");

  const decodedAccessToken = useMemo<{ userId: string } | undefined>(() => {
    return decodeJwtToken<{ userId: string }>({
      token: accessToken,
    });
  }, [accessToken]);

  const isAuthenticated = useMemo<boolean>(() => {
    return accessToken !== undefined ? true : false;
  }, [accessToken]);

  const [userId, setUserId] = useState<string | undefined>(
    decodedAccessToken?.userId,
  );

  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: loginUser } = useLoginUser();
  const { mutate: signupUser } = useSignupUser();
  const { mutate: logoutUser } = useLogoutUser();

  useEffect(() => {
    if (!accessToken && refreshTokenCookie) {
      void refreshToken().then(() => {
        setAccessToken(cookies.get("access_token"));
        void navigate("/");
      });
    }
  }, [navigate, accessToken, refreshTokenCookie]);

  const login = (data: Pick<Account, "email" | "password">) => {
    loginUser(data, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error logging in!",
          description: error.message,
        });
      },
      onSuccess: () => {
        setUserId(decodedAccessToken?.userId);
        setAccessToken(cookies.get("access_token"));
        void navigate("/");
      },
    });
  };

  const logout = () => {
    logoutUser(undefined, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error logging out!",
          description: error.message,
        });
      },
      onSuccess: () => {
        setUserId(undefined);
        void navigate("/login");
      },
    });
  };

  const signup = (
    data: Pick<Account, "email" | "password"> &
      Omit<Profile, "userId" | "createdAt" | "updatedAt" | "deletedAt">,
  ) => {
    signupUser(data, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error signing up!",
          description: error.message,
        });
      },
      onSuccess: () => {
        toast({
          title: "Successfully signed up!",
          description: "Welcome to the club. You are now signed up",
          action: (
            <ToastAction altText="Login" onClick={() => void navigate("/")}>
              Login
            </ToastAction>
          ),
        });
        void navigate("/login");
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook lives next to its provider; editing this file triggers a full reload instead of HMR
export const useAuth = (): AuthProviderValue => {
  const authContext = useContext(AuthContext);

  const auth = useMemo(() => {
    if (!authContext) {
      throw new Error("useAuth must be used within an AuthProvider");
    }

    const auth: AuthProviderValue = {
      isAuthenticated: authContext.isAuthenticated,
      userId: authContext.userId,
      login: authContext.login,
      logout: authContext.logout,
      signup: authContext.signup,
    };

    return auth;
  }, [authContext]);

  return auth;
};
