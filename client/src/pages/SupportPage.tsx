import { useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar, UserMetaInfo, SharePagePopup } from "@/features/support";

const SupportPage = () => {
  const params = useParams();
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);

  if (!params.username) return <h1> No user </h1>;

  return (
    <article
      aria-label={`${params.username}'s Happr Page`}
      className="w-full flex flex-col gap-8 bg-card text-card-foreground"
    >
      <header>
        <Navbar />
      </header>

      <main>
        {openShareModal && (
          <SharePagePopup
            userInfo={{ username: params.username, fullName: "Charming Dc" }}
            setOpenShareModal={setOpenShareModal}
          />
        )}
        <UserMetaInfo setOpenShareModal={setOpenShareModal} />
      </main>
    </article>
  );
};
export default SupportPage;
