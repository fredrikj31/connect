import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "@shadcn-ui/components/ui/toaster";
import { ThemeProvider } from "./providers/theme";
import { AuthProvider } from "./providers/auth";
import { AuthenticatedRouteLayout } from "./routes/_authenticated/route";
import { IndexRoute } from "./routes/_authenticated.index/route";
import { FriendsRoute } from "./routes/_authenticated.friends/route";
import { SettingsRoute } from "./routes/_authenticated.settings/route";
import { LandingRoute } from "./routes/landing/route";
import { LoginRoute } from "./routes/login/route";
import { SignupRoute } from "./routes/signup/route";
import { OnboardingRoute } from "./routes/onboarding/route";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="connect-theme">
          <AuthProvider>
            <Routes>
              <Route path="/landing" element={<LandingRoute />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/signup" element={<SignupRoute />} />
              <Route path="/onboarding" element={<OnboardingRoute />} />
              <Route path="/" element={<AuthenticatedRouteLayout />}>
                <Route index element={<IndexRoute />} />
                <Route path="friends" element={<FriendsRoute />} />
                <Route path="settings" element={<SettingsRoute />} />
              </Route>
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
