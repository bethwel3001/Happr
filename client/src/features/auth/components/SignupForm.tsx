import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FieldErrorMsg from "./FieldErrorMsg";
import ChooseUsernameForm from "./ChooseUsernameForm";
import GoogleAuthButton from "./GoogleAuthButton";

import { isAxiosError } from "axios";
import type { FieldError } from "../types";
import useSignup from "../hooks/useSignup";
import useClearFieldError from "../hooks/useClearFieldError";

type FormProps = {
  initialUsername: string;
};

const SignupForm = ({ initialUsername }: FormProps) => {
  const [username, setUsername] = useState(initialUsername);
  const [isUsernameChosen, setIsUsernameChosen] = useState(!!initialUsername);
  const [fieldsError, setFieldsError] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clearFieldError = useClearFieldError(setFieldsError);
  const { mutate: signup, isPending } = useSignup();

  useEffect(() => {
    setUsername(initialUsername);
    setIsUsernameChosen(!!initialUsername);
  }, [initialUsername]);

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signup(
      {
        email: email.trim(),
        username: username.trim(),
        password: password.trim()
      },
      {
        onSuccess: () => {
          setEmail("");
          setPassword("");
          setFieldsError(null);
        },
        onError: (error: unknown) => {
          if (isAxiosError(error) && error.response?.data?.errors) {
            const errObj = error.response.data.errors.reduce(
              (acc: Record<string, string[]>, curr: FieldError) => {
                acc[curr.field] = curr.errors;
                return acc;
              },
              {}
            );
            setFieldsError(errObj);
          }
        }
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <h2 className="text-primary text-2xl">
        {isUsernameChosen ? `Welcome, ${username}` : "Get started,"}
      </h2>
      <p>
        {isUsernameChosen
          ? "Complete your signup with one of the methods below"
          : "Claim your Happr page."}
      </p>

      {isUsernameChosen ? (
        <form
          onSubmit={handleSignup}
          className="w-full flex flex-col gap-1 py-4"
        >
          <GoogleAuthButton />

          <p className="self-center font-fredoka font-bold text-primary mt-4 mb-6 ml-1">
            OR CONTINUE WITH
          </p>

          <label htmlFor="email-input" className="ml-1 font-bold text-primary">
            Email:
          </label>
          {fieldsError?.email && <FieldErrorMsg msg={fieldsError.email[0]} />}
          <Input
            id="email-input"
            name="email"
            type="email"
            value={email}
            disabled={isPending}
            onChange={e => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            placeholder="Enter a valid email address"
            className="mb-3"
          />

          <label
            htmlFor="password-input"
            className="ml-1 font-bold text-primary"
          >
            Password:
          </label>
          {fieldsError?.password && (
            <FieldErrorMsg msg={fieldsError.password[0]} />
          )}
          <Input
            id="password-input"
            name="password"
            type="password"
            value={password}
            disabled={isPending}
            onChange={e => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            placeholder="Enter your password"
            className="mb-6"
          />

          <Button
            disabled={!email || !password || isPending}
            className="w-full h-14"
          >
            {isPending ? "Signing up..." : "Sign up"}
          </Button>
        </form>
      ) : (
        <ChooseUsernameForm
          username={username}
          setUsername={setUsername}
          onUsernameChosen={() => setIsUsernameChosen(true)}
        />
      )}

      <p className="self-center text-center -mt-2">
        Already on Happr?
        <Link to="/signin" className="text-primary">
          {" "}
          Signin here
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
