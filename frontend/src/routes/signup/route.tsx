import { useState } from "react";
import { Link, Navigate } from "react-router";
import { DateTime } from "luxon";
import { MessageCircle } from "lucide-react";
import { Button } from "@shadcn-ui/components/ui/button";
import { Input } from "@shadcn-ui/components/ui/input";
import { Label } from "@shadcn-ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadcn-ui/components/ui/select";
import { Checkbox } from "@shadcn-ui/components/ui/checkbox";
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { DatePicker } from "../../components/DatePicker";
import { useAuth } from "../../providers/auth";
import { Gender, GenderSchema } from "../../types/gender";
import { ProfileSchema, UsernameSchema } from "../../types/profile";

export const SignupRoute = () => {
  const { toast } = useToast();
  const { isAuthenticated, isPending, signup } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState<Gender>("PREFER_NOT_TO_SAY");
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  if (isPending) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const submit = () => {
    if (!email || !password || !acceptedTerms) {
      toast({
        title: "Fields Empty!",
        description:
          "Please fill out all the input fields and accept the terms",
      });
      return;
    }

    const parsedUsername = UsernameSchema.safeParse(username);
    if (!parsedUsername.success) {
      toast({
        title: "Check your username",
        description: parsedUsername.error.issues[0]?.message,
      });
      return;
    }

    const parsedProfile = ProfileSchema.pick({
      firstName: true,
      lastName: true,
      birthDate: true,
      gender: true,
    }).safeParse({
      firstName,
      lastName,
      birthDate: birthDate
        ? DateTime.fromJSDate(birthDate).toFormat("yyyy-LL-dd")
        : "",
      gender,
    });
    if (!parsedProfile.success) {
      toast({
        title: "Check the form",
        description: parsedProfile.error.issues[0]?.message,
      });
      return;
    }

    signup({
      email,
      username: parsedUsername.data,
      password,
      ...parsedProfile.data,
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-zinc-200 dark:bg-zinc-900 w-full p-16 hidden md:flex flex-col justify-between">
        <div className="flex flex-row items-center gap-2">
          <MessageCircle className="size-12 text-black dark:text-white" />
          <h1 className="text-5xl font-semibold">Connect</h1>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-2xl italic">
            “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi eu
            sapien et justo porttitor mollis eget nec justo. Donec rutrum ligula
            augue, vitae euismod justo convallis vitae.”
          </p>
          <span className="text-xl text-zinc-700 dark:text-zinc-400">
            - John Doe
          </span>
        </div>
      </div>
      <div className="bg-zinc-300 dark:bg-zinc-950 w-full p-8 flex justify-center items-center">
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-center">
              Create an account
            </h1>
            <h3 className="text-zinc-700 dark:text-zinc-400 text-center">
              Fill out the form below to create an account
            </h3>
          </div>
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
          <Label className="sr-only" htmlFor="username">
            Username
          </Label>
          <Input
            id="username"
            placeholder="Username"
            type="text"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <div className="flex flex-row gap-2">
            <Label className="sr-only" htmlFor="firstName">
              First Name
            </Label>
            <Input
              id="firstName"
              placeholder="First Name"
              autoComplete="given-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
            />
            <Label className="sr-only" htmlFor="lastName">
              Last Name
            </Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              autoComplete="family-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              date={birthDate}
              onDateSelected={(date) => setBirthDate(date)}
            />
            <Select
              value={gender}
              onValueChange={(value) => {
                const parsed = GenderSchema.safeParse(value);
                if (parsed.success) {
                  setGender(parsed.data);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-2 items-start">
            <div className="mt-0.5">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
              />
            </div>
            <div className="flex flex-col">
              <span>Accept terms and conditions</span>
              <span className="text-zinc-700 dark:text-zinc-400 text-sm">
                You agree to our Terms of Service and Privacy Policy.
              </span>
            </div>
          </div>
          <Button type="submit">Sign Up</Button>
          <span className="text-sm text-center text-zinc-700 dark:text-zinc-400">
            Already have an account?{" "}
            <Link className="underline" to="/login">
              Log in
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};
