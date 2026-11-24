import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
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
import { useToast } from "@shadcn-ui/components/ui/use-toast";
import { DatePicker } from "../../components/DatePicker";
import { useAuth } from "../../providers/auth";
import { useGetProfile } from "../../api/profiles/getProfile/useGetProfile";
import { useCreateProfile } from "../../api/profiles/createProfile/useCreateProfile";
import { Gender, GenderSchema } from "../../types/gender";
import { ProfileSchema } from "../../types/profile";

/**
 * Second half of signup for users who have an account but no profile yet
 * (the signup form normally creates both; this catches a failed second step).
 */
export const OnboardingRoute = () => {
  const { isAuthenticated, isPending } = useAuth();
  const profile = useGetProfile({ enabled: isAuthenticated });
  const { mutate: createProfile, isPending: isCreatingProfile } =
    useCreateProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [gender, setGender] = useState<Gender>("PREFER_NOT_TO_SAY");

  if (isPending) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile.isSuccess) {
    return <Navigate to="/" replace />;
  }

  const submit = () => {
    const parsed = ProfileSchema.pick({
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

    if (!parsed.success) {
      toast({
        title: "Check the form",
        description: parsed.error.issues[0]?.message ?? "Invalid profile",
      });
      return;
    }

    createProfile(parsed.data, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error creating profile!",
          description: error.message,
        });
      },
      onSuccess: () => {
        void navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-8">
      <div className="flex flex-col gap-3 w-80">
        <div className="flex flex-row items-center gap-2 self-center">
          <MessageCircle className="size-8 text-black dark:text-white" />
          <h1 className="text-3xl font-semibold">Connect</h1>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-center">Almost there</h1>
          <h3 className="text-zinc-700 dark:text-zinc-400 text-center">
            Tell us a bit about yourself to finish setting up your account
          </h3>
        </div>
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
        <Button onClick={submit} disabled={isCreatingProfile}>
          Finish
        </Button>
      </div>
    </div>
  );
};
