import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import Button from "@/components/ui/Button";

type UserInfo = {
  username: string;
  fullName: string;
};

type PopupProps = {
  userInfo: UserInfo;
  setOpenShareModal: Dispatch<SetStateAction<boolean>>;
};

const SharePagePopup = ({ userInfo, setOpenShareModal }: PopupProps) => {
  const { copy, copied } = useCopyToClipboard();
  const { username, fullName } = userInfo;
  const pageLink = `${window.location.origin}/${username}`;

  const handleCopy = async () => {
    try {
      await copy(pageLink);
    } catch (err: uknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error has occured.");
      }
    }
  };

  return (
    <div className="fixed bottom-0 w-full flex flex-col items-center gap-4 bg-background p-4 pb-6 border border-border rounded-tl-lg rounded-tr-lg">
      <X
        className="self-end mr-[3%]"
        onClick={() => setOpenShareModal(false)}
      />

      <h1 className="font-bold text-xl">Share {fullName}'s Page</h1>

      <div className="w-full flex items-center justify-evenly">
        <span className="flex items-center h-12 p-4 border border-primary rounded-md">
          {pageLink}
        </span>

        <Button className="rounded-md" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
};
export default SharePagePopup;
