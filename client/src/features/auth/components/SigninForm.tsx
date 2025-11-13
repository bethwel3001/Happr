import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FieldErrorMsg from "./FieldErrorMsg";
import GoogleAuthButton from "./GoogleAuthButton";

import { isAxiosError } from "axios";
import type { FieldError } from "../types";
import useSignin from "../hooks/useSignin";
import useClearFieldError from "../hooks/useClearFieldError";

const SigninForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fieldsError, setFieldsError] = useState<Record<
    string,
    string[]
  > | null>(null);

  const navigate = useNavigate();
  const clearFieldError = useClearFieldError(setFieldsError);
  const { mutate: signin, isPending } = useSignin();

  const handleSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signin(
      {
        email: email.trim(),
        password: password.trim()
      },
      {
        onSuccess: () => {
          setEmail("");
          setPassword("");

          setTimeout(() => navigate("/dashboard"), 2000);
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
      <h2 className="text-primary text-2xl">Welcome back,</h2>

      <form onSubmit={handleSignin} className="w-full flex flex-col gap-1 py-4">
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

        <label htmlFor="password-input" className="ml-1 font-bold text-primary">
          Password:
        </label>
        {fieldsError?.password && (
          <FieldErrorMsg msg={fieldsError.password[0]} />
        )}
        <Input
          id="password-input"
          name="password"
          type="password"
          disabled={isPending}
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          placeholder="Enter your password"
        />

        <Link to="/reset-password" className="self-end text-primary mt-2 mb-6">
          <strong> Forgot your password?</strong>
        </Link>

        <Button
          disabled={!email || !password || isPending}
          className="w-full h-14"
        >
          {isPending ? "Authenticating..." : "Sign In"}
        </Button>
      </form>

      <p className="sef-center text-center -mt-2">
        {"Don't have an account?"}
        <Link to="/signup" className="text-primary">
          {""} Signup here
        </Link>
      </p>
    </div>
  );
};
export default SigninForm;
