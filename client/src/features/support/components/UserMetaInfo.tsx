import type { Dispatch, SetStateAction } from "react";
import { Share2 } from "lucide-react";
import Button from "@/components/ui/Button";

type PageProps = {
  setOpenShareModal: Dispatch<SetStateAction<boolean>>;
};

const UserMetaInfo = ({ setOpenShareModal }: PageProps) => {
  return (
    <section
      aria-label="User Meta Info"
      className="w-full flex flex-col items-center justify-center bg-background
      rounded-bl-lg rounded-br-lg"
    >
      <div
        aria-label="cover photo wrapper"
        className="w-full h-48 bg-card bg-[url('/icons/happr-banner.jpg')]
        bg-center bg-contain"
      ></div>

      <div className="w-full flex items-center justify-between px-4 [&_span]:h-10 [&_span]:w-10 [&_span]:mt-4">
        <div
          aria-label="display photo wrapper"
          className="w-32 h-32 bg-card border-2 border-background -mt-16 rounded-full"
        >
          <img
            src="https://i.pravatar.cc/300"
            className="w-full h-full object-cover rounded-full"
            alt="Charmingdc's Avatar"
          />
        </div>

        <Button
          variant="filled"
          className="w-fit h-fit flex items-center gap-2 py-1"
          onClick={() => setOpenShareModal(prev => !prev)}
        >
          <Share2 size={16} />
          Share
        </Button>
      </div>

      <h2 className="self-start font-extrabold text-2xl mt-2 mb-4 ml-4">
        Charming Dc
      </h2>
    </section>
  );
};
export default UserMetaInfo;
