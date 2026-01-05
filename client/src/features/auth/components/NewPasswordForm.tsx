import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FieldErrorMsg from "./FieldErrorMsg";
import useClearFieldError from "../hooks/useClearFieldError";

import { useResetPassword } from "@/features/auth";
import type { AuthFormError } from "../types";

const NewPasswordForm = () => {
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending: resettingPassword } =
    useResetPassword();

  const [newPassword, setNewPassword] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<
    string,
    string[]
  > | null>(null);

  const clearFieldError = useClearFieldError(setFieldsError);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldsError(null);

    const trimmed = newPassword.trim();
    if (!trimmed) {
      setFieldsError({
        newPassword: ["Please enter your preferred password."]
      });
      return;
    }

    if (trimmed.length < 8) {
      setFieldsError({
        newPassword: ["Password must not be less than 8 characters."]
      });
      return;
    }

    resetPassword(
      { newPassword: trimmed },
      {
        onSuccess: () => {
          setTimeout(() => navigate("/dashboard"), 500);
        },
        onError: (error: unknown) => {
          if (
            typeof error === "object" &&
            error !== null &&
            "fieldsError" in error
          ) {
            const e = error as AuthFormError;
            if (e.fieldsError) setFieldsError(e.fieldsError);
          } else if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Something went wrong while resetting password.");
          }
        }
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <h2 className="text-primary text-2xl">Enter New Password</h2>

      <p className="text-sm mb-4">
        Enter your preferred password in the input below
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 py-4">
        <label htmlFor="password-input" className="ml-1 font-bold text-primary">
          New Password:
        </label>
        {fieldsError?.newPassword && (
          <FieldErrorMsg msg={fieldsError.newPassword[0]} />
        )}
        <Input
          id="password-input"
          name="newPassword"
          type="password"
          value={newPassword}
          placeholder="Enter your preferred password"
          disabled={resettingPassword}
          onChange={e => {
            setNewPassword(e.target.value);
            clearFieldError("newPassword");
          }}
          className="mb-3"
        />

        <Button
          disabled={!newPassword || resettingPassword}
          className="w-full h-14"
        >
          {resettingPassword ? "Processing..." : "Submit"}
        </Button>
      </form>

      <p className="text-center -mt-2">
        Remembered your password?{" "}
        <Link to="/signin" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default NewPasswordForm;
