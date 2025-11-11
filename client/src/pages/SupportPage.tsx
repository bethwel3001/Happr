import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Navbar,
  UserMetaInfo,
  SharePagePopup,
  AboutUserSection,
  TipUserSection,
  RecentSupportersSection,
  CtaSection
} from "@/features/support";

const SupportPage = () => {
  const params = useParams();
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);

  if (!params.username) return <h1> No user </h1>;

  return (
    <article
      aria-label={`${params.username}'s Happr Page`}
      className="w-full min-h-screen flex flex-col bg-card font-openSans text-card-foreground pb-6"
    >
      <header>
        <Navbar />
      </header>

      <main className="w-full flex flex-col items-center gap-3">
        {openShareModal && (
          <SharePagePopup
            userInfo={{ username: params.username, fullName: "Charming Dc" }}
            setOpenShareModal={setOpenShareModal}
          />
        )}
        <UserMetaInfo setOpenShareModal={setOpenShareModal} />
        <AboutUserSection />
        <TipUserSection />
        <RecentSupportersSection />
        <CtaSection />
      </main>

      <footer className="w-full flex flex-col items-center text-center gap-3 mt-8">
        <p>© 2025 - {new Date().getFullYear()} Happr.</p>
      </footer>
    </article>
  );
};
export default SupportPage;
