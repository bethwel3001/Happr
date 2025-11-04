import type { Dispatch, SetStateAction } from "react";
import { Share2 } from "lucide-react";

type PageProps = {
  setOpenShareModal: Dispatch<SetStateAction<boolean>>;
};

const UserMetaInfo = ({ setOpenShareModal }: PageProps) => {
  return (
    <section
      aria-label="User Meta Info"
      className="w-full flex flex-col items-center justify-center"
    >
      <div
        aria-label="cover photo wrapper"
        className="w-full h-48 bg-purple-400"
      ></div>

      <div className="w-full flex items-center justify-between px-4 [&_span]:h-10 [&_span]:w-10 [&_span]:mt-4">
        <span aria-label="space holder"> {""} </span>

        <div
          aria-label="cover photo wrapper"
          className="w-32 h-32 bg-purple-400 border-2 border-background -mt-16 rounded-md"
        ></div>

        <span>
          <Share2 onClick={() => setOpenShareModal(prev => !prev)} />
        </span>
      </div>

      <h2 className="font-extrabold text-2xl my-2"> Charming Dc </h2>
    </section>
  );
};
export default UserMetaInfo;
