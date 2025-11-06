import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { X, QrCode } from "lucide-react";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import Button from "@/components/ui/Button";
import QrCodeCard from "./QrCodeCard";

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
  const [showQrcode, setShowQrcode] = useState<boolean>(false);

  const { username, fullName } = userInfo;
  const pageLink = `${window.location.origin}/${username}`;

  const qrSrc = (() => {
    const qrParams = new URLSearchParams({
      text: pageLink,
      size: "220",
      centerImageUrl:
        "https://raw.githubusercontent.com/Charmingdc/Happr/main/client/public/icons/happr-icon.jpg",
      centerImageSizeRatio: "0.2"
    });

    return `https://quickchart.io/qr?${qrParams}`;
  })();

  const handleCopy = async () => {
    try {
      await copy(pageLink);
    } catch (err: unknown) {
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
        <span className="w-auto md:w-[85%] flex items-center h-12 p-4 border border-primary rounded-md overflow-hidden">
          {pageLink}
        </span>

        <Button className="w-auto md:w-[10%] rounded-md" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div
        className="w-[94%] h-14 flex items-center justify-center gap-2 p-2
      bg-accent rounded-md"
        onClick={() => setShowQrcode(prev => !prev)}
      >
        <QrCode size={18} /> {showQrcode ? "Close" : "Get QrCode"}
      </div>

      {showQrcode && <QrCodeCard qrSrc={qrSrc} username={username} />}
    </div>
  );
};

export default SharePagePopup;
