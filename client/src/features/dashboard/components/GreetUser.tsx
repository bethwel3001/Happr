import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

const GreetUser = () => {
  const { user } = useAuth();
  const { copy, copied } = useCopyToClipboard();

  const username: string = user?.username || "";
  const displayName: string = user?.display_name || user?.username || "";
  const userPageLink: string = `${window.location.origin}/${username}`;

  const handleCopy = async (text: string) => {
    try {
      await copy(text);
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  return (
    <section className="w-full flex items-center justify-between">
      <div>
        <p className="font-bold text-md mb-[.1rem]"> Hi, {displayName}, </p>
        <p className="text-sm"> {userPageLink} </p>
      </div>

      <button
        onClick={() => handleCopy(userPageLink)}
        className="bg-card text-card-foreground py-2 px-4 font-bold text-md rounded-full"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </section>
  );
};
export default GreetUser;
