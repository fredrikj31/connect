import { useState } from "react";
import { Link, Navigate } from "react-router";
import { Button } from "@shadcn-ui/components/ui/button";
import { Input } from "@shadcn-ui/components/ui/input";
import { Label } from "@shadcn-ui/components/ui/label";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { useAuth } from "../../providers/auth";

export const LoginRoute = () => {
  const { toast } = useToast();
  const { isAuthenticated, isPending, login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  if (isPending) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = () => {
    if (!email || !password) {
      toast({
        title: "Empty fields!",
        description: "Please fill out all the fields.",
      });
      return;
    }

    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <form
        className="flex flex-col gap-4 w-80"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-2xl font-bold">Login</h1>
          <h3 className="text-lg text-zinc-600">Log into your account</h3>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            placeholder="Email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect="off"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <Button type="submit">Login</Button>
        <span className="text-sm text-center text-zinc-600 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link className="underline" to="/signup">
            Sign up
          </Link>
        </span>
      </form>
    </div>
  );
};
