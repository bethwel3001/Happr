import { useState } from "react";
import { toast } from "sonner";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";

import useUpdateEmail from "../hooks/useUpdateEmail";
import { useAuth } from "@/hooks/useAuth";

const AccountSettings = () => {
  const { user, deleteAccount, isDeletingAccount } = useAuth();
  const { mutate: updateEmail, isPending: updatingEmail } = useUpdateEmail();

  const [usernameState, setUsernameState] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const handleEmailUpdate = (e: React.FormEvent<HTMLFormEvent>) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter a valid email");
      return;
    }

    updateEmail({ email });
  };

  return (
    <div
      aria-labelledby="Account Settings"
      className="w-full flex flex-col gap-4"
    >
      <h2 className="text-2xl"> Account Settings </h2>

      <form
        aria-label="account settings form"
        onSubmit={e => handleEmailUpdate(e)}
        className="w-full flex flex-col gap-4 mt-4"
      >
        <div className="w-full flex flex-col gap-1 p-4 border rounded-md">
          <label htmlFor="email-input" className="font-bold text-lg">
            Email
          </label>
          <p className="text-xs text-muted-foreground">
            To change your email, enter a valid email address below. You will
            need to verify the new email to access your account.
          </p>

          <Input
            type="text"
            id="email-input"
            value={email}
            disabled={updatingEmail || isDeletingAccount}
            placeholder={user?.email || ""}
            onChange={e => setEmail(e.target.value)}
            className="mt-3 mb-1"
          />

          <Button
            disabled={!email || updatingEmail || isDeletingAccount}
            className="w-fit"
          >
            {updatingEmail ? "Updating..." : "Update Email"}
          </Button>
        </div>
      </form>

      <div
        aria-label="delete account section"
        className="w-full flex flex-col gap-1 p-4 text-destructive-foreground border rounded-md"
      >
        <label htmlFor="username-input" className="font-bold text-lg">
          Delete your account
        </label>
        <p className="text-xs text-muted-foreground">
          Deleting your account will erase all data associated with it.
        </p>

        <label
          htmlFor="username-input"
          className="font-bold text-xs text-muted-foreground mt-4 ml-1"
        >
          Enter your username
        </label>
        <Input
          type="text"
          id="username-input"
          value={usernameState}
          placeholder={user?.username || ""}
          disabled={isDeletingAccount}
          onChange={e => setUsernameState(e.target.value)}
          className="my-1"
        />

        <Button
          variant="destructive"
          disabled={usernameState !== user?.username}
          onClick={() => deleteAccount()}
          className="mt-4"
        >
          Delete Account
        </Button>

        {isDeletingAccount && (
          <LoadingScreen className="fixed left-0 w-screen h-screen bg-white/50" />
        )}
      </div>
    </div>
  );
};
export default AccountSettings;
