import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { useResetPassword } from "@/features/auth";

const NewPasswordForm = () => {
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending: resettingPassword } =
    useResetPassword();

  const [newPassword, setNewPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = newPassword.trim();
    if (!trimmed) {
      toast.error("Please enter your preferred password.");
      return;
    }

    if (trimmed.length < 8) {
      toast.error("Password must not be less than 8 digits.");
      return;
    }

    resetPassword(
      { newPassword },
      {
        onSuccess: () => setTimeout(() => navigate("/dashboard"), 500)
      }
    );
  };

  return (
    <div className="w-full flex flex-col gap-2" aria-labelledby="new-password">
      <h2 className="text-primary text-2xl">Enter New Password</h2>

      <p className="text-sm mb-4">
        Enter your preferred password in the input below
      </p>

      <form
        aria-label="Choose New Password Form"
        onSubmit={e => handleSubmit(e)}
        className="w-full flex flex-col gap-2 py-4"
      >
        <Input
          id="password-input"
          name="password"
          type="password"
          value={newPassword}
          placeholder="Enter your preferred password"
          disabled={resettingPassword}
          onChange={e => setNewPassword(e.target.value)}
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
