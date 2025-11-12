import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useUsernameAvailability } from "@/features/auth";
import type { Dispatch, SetStateAction } from "react";

type FormProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  onUsernameChosen: () => void;
};

const ChooseUsernameForm = ({
  username,
  setUsername,
  onUsernameChosen
}: FormProps) => {
  const { refetch, isFetching } = useUsernameAvailability(username);

  const handleSubmit = async () => {
    const trimmed = username.trim();

    if (trimmed.length < 3) {
      toast.warning("Username must be at least 3 characters");
      return;
    }

    const result = await refetch();

    if (result.isError) {
      toast.error("Failed to check username");
      return;
    }

    if (result.data && !result.data.success) {
      toast.error(result.data.message);
      return;
    }

    sessionStorage.setItem("usernameConfirmed", trimmed);
    onUsernameChosen();
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full flex flex-col items-center gap-4 py-4 mt-4"
    >
      <div className="h-14 w-full flex items-center py-3 px-5 text-sm bg-input text-input-foreground border border-input rounded-full">
        <p> https://happr.me/</p>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="username"
          className="h-full bg-transparent text-input-foreground px-[.1rem]"
        />
      </div>

      <Button
        disabled={username.trim().length < 3 || isFetching}
        className="w-full"
      >
        {isFetching ? "Checking..." : "Continue"}
      </Button>
    </form>
  );
};

export default ChooseUsernameForm;
