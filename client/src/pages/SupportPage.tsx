import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Navbar,
  UserMetaInfo,
  SharePagePopup,
  AboutUserSection,
  TipUserSection,
  RecentSupportersSection,
  CtaSection,
  usePublicProfile
} from "@/features/support";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ErrorBox from "@/components/ui/ErrorBox";

const SupportPage = () => {
  const params = useParams();
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);

  const { data: response, isLoading, error } = usePublicProfile(params.username);
  const user = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <ErrorBox title="Error" message={error?.message || "User not found"} />
    </div>
  );

  return (
    <article
      aria-label={`${user.display_name}'s Happr Page`}
      className="w-full min-h-screen flex flex-col bg-card font-openSans text-card-foreground pb-6"
    >
      <header>
        <Navbar />
      </header>

      <main className="w-full flex flex-col items-center gap-3">
        {openShareModal && (
          <SharePagePopup
            userInfo={{ username: user.username, fullName: user.display_name! }}
            setOpenShareModal={setOpenShareModal}
          />
        )}
        <UserMetaInfo user={user} setOpenShareModal={setOpenShareModal} />
        <AboutUserSection user={user} />
        <TipUserSection user={user} />
        <RecentSupportersSection user={user} />
        <CtaSection />
      </main>

      <footer className="w-full flex flex-col items-center text-center gap-3 mt-8">
        <p>© 2025 - {new Date().getFullYear()} Happr.</p>
      </footer>
    </article>
  );
};
export default SupportPage;

